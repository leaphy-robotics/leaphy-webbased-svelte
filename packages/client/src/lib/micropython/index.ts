import PythonUploader from "$components/core/popups/popups/PythonUploader.svelte";
import type { RobotDevice } from "$domain/robots";
import PopupState from "$state/popup.svelte";
import SerialState from "$state/serial.svelte";
import type { LeaphyPort } from "$state/serial.svelte";
import base64 from "base64-js";
import { delay } from "../programmers/utils";
import { Commands } from "./commands";
import { FileSystem } from "./filesystem";
import { PackageManager } from "./packagagemanager";

class StdoutEvent extends Event {
	static type = "stdout";

	constructor(public data: string) {
		super("stdout");
	}
}
class StderrEvent extends Event {
	static type = "stderr";

	constructor(public data: string) {
		super("stderr");
	}
}
class DoneEvent extends Event {
	static type = "done";

	constructor(
		public stdout: string,
		public stderr: string,
	) {
		super("done");
	}
}

class RestartEvent extends Event {
	static type = "restart";

	constructor(public source: IOEventTarget) {
		super("restart");
	}
}

type IOEvent =
	| ({ type: "stdout" } & StdoutEvent)
	| ({ type: "stderr" } & StderrEvent)
	| ({ type: "done" } & DoneEvent)
	| ({ type: "restart" } & RestartEvent);

export class IOEventTarget extends EventTarget {
	public addEventListener<
		T extends IOEvent["type"],
		E extends IOEvent & { type: T },
	>(type: T, listener: ((e: Event & E) => void) | null) {
		super.addEventListener(type, listener);
	}

	public signalRestart() {
		super.dispatchEvent(new RestartEvent(this));
	}
}

enum Mode {
	STDOUT = 0,
	STDERR = 1,
	NONE = 2,
}

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export default class MicroPythonIO {
	public commands: Commands = new Commands(this);
	public fs: FileSystem = new FileSystem(this);
	public packageManager: PackageManager = new PackageManager(this);
	public port: LeaphyPort;
	public reader: ReadableStreamDefaultReader<Uint8Array>;
	public writer: WritableStreamDefaultWriter<Uint8Array>;
	public running: boolean;

	async initialize() {
		await PopupState.open({
			component: PythonUploader,
			data: { io: this },
			allowInteraction: false,
		});
	}

	async getFirmware(robot: RobotDevice) {
		const firmwareSources = {
			l_nano_esp32:
				"https://raw.githubusercontent.com/leaphy-robotics/leaphy-firmware/main/micropython/esp32.bin",
		};

		const res = await fetch(firmwareSources[robot.id]);
		const content = await res.arrayBuffer();

		return {
			sketch: base64.fromByteArray(new Uint8Array(content)),
		};
	}

	async enterREPLMode() {
		await SerialState.ready;

		return SerialState.withPort(async (port) => {
			this.port = port;
			this.reader = this.port.readable.getReader();
			this.writer = this.port.writable.getWriter();

			try {
				await new Promise((resolve) => setTimeout(resolve, 500));
				// cancel running program (if any), soft reboot, enter raw REPL.
				await this.writer.write(new Uint8Array([3, 4, 1]));

				const microPythonInstalled = await Promise.race([
					new Promise<boolean>((resolve) =>
						setTimeout(() => resolve(false), 2000),
					),
					(async () => {
						while (true) {
							const { value, done } = await this.reader.read();

							if (done) {
								return false;
							}
							if (value.at(-1) !== 62) {
								continue;
							}

							return true;
						}
					})(),
				]);

				if (!microPythonInstalled) {
					throw new Error("Connection with Micropython failed.");
				}

				await this.commands.loadCommands();
				return true;
			} catch (e) {
				this.reader.releaseLock();
				this.writer.releaseLock();
				this.reader = undefined;
				this.writer = undefined;
				throw e;
			}
		});
	}

	runCode(code: string) {
		const need_restart = this.running;
		this.running = true;
		const events = new IOEventTarget();
		(async () => {
			console.log(need_restart);
			if (need_restart) {
				//Another program was previously; send a cancel character,
				//then wait until the previously-made IOEventTarget clears the
				// `running` flag.
				await this.writer.write(new Uint8Array([0x03]));
				while (this.running) {
					await new Promise((resolve) => {
						setTimeout(resolve, 100);
					});
				}
				this.running = true;
			}
			const data = encoder.encode(`${code}\x04`);
			for (let offset = 0; offset < data.length; offset += 256) {
				await this.writer.write(data.slice(offset, offset + 256));
				await delay(5);
			}

			let content = "";
			while (true) {
				const { value, done: disconnected } = await this.reader.read();
				if (disconnected) throw new Error("Disconnected");

				content += decoder.decode(value);
				if (content.length < 2) continue;

				if (content.slice(0, 2) !== "OK") {
					console.log("Unexpected data: ", content);
					throw new Error("Compile error");
				}

				break;
			}

			let stdoutContent = "";
			let stderrContent = "";
			let done = false;
			let mode = Mode.STDOUT;

			const parseMessage = (message: string) => {
				const [data, ...parts] = message.split("\x04");
				switch (mode) {
					case Mode.STDOUT: {
						events.dispatchEvent(new StdoutEvent(data));
						stdoutContent += data;
						break;
					}
					case Mode.STDERR: {
						events.dispatchEvent(new StderrEvent(data));
						stderrContent += data;
						break;
					}
					case Mode.NONE: {
						console.log(`NONE hit. Data: ${data}.`);
						if (data !== ">") break;

						this.running = false;
						events.dispatchEvent(new DoneEvent(stdoutContent, stderrContent));
						done = true;
						break;
					}
				}

				if (parts.length > 0) {
					mode++;
					parseMessage(parts.join("\x04"));
				}
			};
			parseMessage(content.slice(2));

			while (!done) {
				const { value, done } = await this.reader.read();
				if (done) break;

				parseMessage(decoder.decode(value));
			}
		})();

		return events;
	}
}
