import Uploader from "$components/core/popups/popups/Uploader.svelte";
import { popups } from "$state/popup.svelte";
import { port } from "$state/workspace.svelte";
import base64 from "base64-js";
import { get } from "svelte/store";
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

type IOEvent =
	| ({ type: "stdout" } & StdoutEvent)
	| ({ type: "stderr" } & StderrEvent)
	| ({ type: "done" } & DoneEvent);

export class IOEventTarget extends EventTarget {
	public addEventListener<
		T extends IOEvent["type"],
		E extends IOEvent & { type: T },
	>(type: T, listener: ((e: Event & E) => void) | null) {
		super.addEventListener(type, listener);
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
	public port: SerialPort;
	public reader: ReadableStreamDefaultReader<Uint8Array>;
	public writer: WritableStreamDefaultWriter<Uint8Array>;
	public running: boolean;

	async getFirmware() {
		const res = await fetch(
			"https://raw.githubusercontent.com/leaphy-robotics/leaphy-firmware/main/micropython/firmware.uf2",
		);
		const content = await res.arrayBuffer();

		return {
			sketch: base64.fromByteArray(new Uint8Array(content)),
		};
	}

	async enterREPLMode() {
		await port.ready;
		await port.reserve();

		this.port = get(port);
		this.reader = this.port.readable.getReader();
		this.writer = this.port.writable.getWriter();

		await new Promise((resolve) => setTimeout(resolve, 500));
		await this.writer.write(new Uint8Array([1]));

		const microPythonInstalled = await Promise.race([
			new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000)),
			(async (resolve) => {
				const { value, done } = await this.reader.read();

				if (done) return resolve(false);
				if (value.at(-1) !== 62) return resolve(false);

				resolve(true);
			})(),
		]);

		if (!microPythonInstalled) {
			this.reader.releaseLock();
			this.writer.releaseLock();

			port.release();
			await popups.open({
				component: Uploader,
				data: { program: await this.getFirmware() },
				allowInteraction: false,
			});

			return await this.enterREPLMode();
		}

		await this.commands.loadCommands();
		await this.packageManager.flashLibrary(
			"github:leaphy-robotics/leaphy-micropython/package.json",
		);

		console.log(this.fs);
	}

	runCode(code: string) {
		this.running = true;
		const events = new IOEventTarget();
		(async () => {
			const data = encoder.encode(`${code}\x04`);
			for (let offset = 0; offset < data.length; offset += 256) {
				await this.writer.write(data.slice(offset, offset + 256));
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
