import type { Debugger } from "@leaphy-robotics/leaphy-blocks";
import MockedFTDISerialPort from "@leaphy-robotics/webusb-ftdi";
import { SerialPort as MockedCDCSerialPort } from "web-serial-polyfill";
import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import { type RobotDevice, robots } from "$domain/robots";
import PopupState from "$state/popup.svelte";
import { clearReadBuffer, delay } from "../programmers/utils";

interface ActiveDebugger {
	type: Debugger;
	lastSignal: number;
	values: number[];
}

export type LeaphyPort =
	| SerialPort
	| MockedCDCSerialPort
	| MockedFTDISerialPort;

interface LogItem {
	id: string;
	date: Date;
	content: string;
}

export enum Prompt {
	NEVER = 0,
	MAYBE = 1,
	ALWAYS = 2,
}

export class ConnectionFailedError {}

export const SUPPORTED_VENDOR_IDS = [
	0x1a86, 9025, 2341, 0x0403, 0x2e8a, 0x303a,
];

export type ConnectionStatus =
	| "disconnected"
	| "connecting"
	| "ready"
	| "failed";

class DebugState {
	debuggers = $state<ActiveDebugger[]>();

	processCommand(command: string[]) {
		switch (command[0]) {
			case "start": {
				this.debuggers = (
					JSON.parse(command.slice(1).join("_")) as Debugger[]
				).map((type) => ({
					type,
					lastSignal: 0,
					values: new Array(type.values).fill(0),
				}));
				break;
			}
			case "log": {
				if (!this.debuggers) break;
				if (!this.debuggers[Number.parseInt(command[1])]) break;

				this.debuggers[Number.parseInt(command[1])].values[
					Number.parseInt(command[2])
				] = Number.parseFloat(command[3]);
				this.debuggers[Number.parseInt(command[1])].lastSignal = Date.now();
				break;
			}
		}
	}

	clear() {
		this.debuggers = null;
	}
}

class LogState {
	log = $state<LogItem[]>([]);
	charts = $state<Record<string, { x: Date; y: number }[]>>({});
	debugger = new DebugState();

	private buffer = "";
	private count = 0;

	constructor(private serial: SerialState) {}

	write(content: string) {
		if (this.serial.writer) {
			this.serial.writer.write(new TextEncoder().encode(content)).then();
		}
	}

	clear() {
		this.charts = {};
		this.log = [];
	}

	getID() {
		return `${this.count++}`;
	}

	enqueue(content: Uint8Array) {
		this.buffer += new TextDecoder().decode(content);

		let items = this.buffer.split("\n");
		this.buffer = items.pop();

		for (const item of items) {
			const [label, value] = item.split(" = ");
			if (!label || !value || Number.isNaN(Number.parseFloat(value))) continue;

			this.point(label, Number.parseFloat(value));
		}
		items = items.filter((item) => {
			const commands = item.split("_");
			if (commands[1] !== "debug") return true;

			try {
				this.debugger.processCommand(commands.slice(2));
			} catch (e) {}

			return false;
		});

		if (items.length > 0) {
			this.log = [
				...this.log,
				...items.map((content) => ({
					id: this.getID(),
					date: new Date(),
					content,
				})),
			].slice(-100);
		}
	}

	point(chart: string, height: number) {
		if (!this.charts[chart]) {
			this.charts[chart] = [];
		}

		this.charts[chart].push({ x: new Date(), y: height });
	}
}

export function waitForReady(serial: SerialState): Promise<void> {
	return new Promise((resolve, reject) => {
		const stop = $effect.root(() => {
			$effect(() => {
				if (serial.status === "ready") {
					stop();
					resolve();
				}
				if (serial.status === "failed") {
					stop();
					reject(new Error("Connection failed"));
				}
			});
		});
	});
}

class SerialState {
	port = $state<LeaphyPort>();
	board = $state<RobotDevice | null>();

	status = $state<ConnectionStatus>("disconnected");

	get isReady() {
		return this.status === "ready";
	}

	get ready(): Promise<void> {
		return waitForReady(this);
	}

	reserved = $state(false);
	reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
	writer: WritableStreamDefaultWriter<Uint8Array> | undefined;

	showFeedback = false;

	log = new LogState(this);

	async initPort() {
		if (!this.port || this.reserved) return;

		if (!this.port.readable || !this.port.writable) {
			try {
				await this.port.open({ baudRate: 115200 });
			} catch (e) {
				this.port = undefined;
				if (this.showFeedback) {
					PopupState.open({
						component: ErrorPopup,
						data: {
							title: "ROBOT_RESERVED",
							message: "ROBOT_RESERVED_MESSAGE",
						},
						allowInteraction: false,
					});
				}

				this.status = "failed";
				throw e;
			}
		}
		if (this.port.readable.locked || this.port.writable.locked) return;

		this.writer = this.port.writable.getWriter();
		this.reader = this.port.readable.getReader();
		this.status = "ready";

		// Run the read loop in the background so connect() can return immediately
		this.runReadLoop();
	}

	private async runReadLoop() {
		while (this.port?.readable && this.port?.writable) {
			const { done, value } = await this.reader.read();
			if (done) break;

			this.log.enqueue(value);
		}

		// Clean up reader when stream ends
		if (this.reader) {
			try {
				this.reader.releaseLock();
			} catch (e) {
				// Reader may have already been released
			}
			this.reader = undefined;
		}
	}

	async requestPort(prompt: Prompt): Promise<SerialPort | USBDevice> {
		this.showFeedback = prompt === Prompt.ALWAYS;
		if (navigator.serial && !navigator.userAgent.includes("Android")) {
			if (prompt !== Prompt.ALWAYS) {
				const [port] = await navigator.serial.getPorts();
				if (port) return port;
			}
			if (prompt === Prompt.NEVER) throw new ConnectionFailedError();

			return await navigator.serial.requestPort({
				filters: SUPPORTED_VENDOR_IDS.map((vendor) => ({
					usbVendorId: vendor,
				})),
			});
		}
		if (navigator.usb) {
			if (prompt !== Prompt.ALWAYS) {
				const [device] = await navigator.usb.getDevices();
				if (device) return device;
			}
			if (prompt === Prompt.NEVER) throw new ConnectionFailedError();

			const device = await navigator.usb.requestDevice({
				filters: SUPPORTED_VENDOR_IDS.map((vendor) => ({
					vendorId: vendor,
				})),
			});
			if (device) return device;

			throw new ConnectionFailedError();
		}
	}

	detectBoard(port: SerialPort | USBDevice) {
		const vendor =
			"vendorId" in port ? port.vendorId : port.getInfo().usbVendorId;
		const product =
			"productId" in port ? port.productId : port.getInfo().usbProductId;

		switch (vendor) {
			// Official arduino vendor ID
			case 0x2341: {
				switch (product) {
					case 0x0043: {
						return robots.l_uno;
					}
					case 0x056b:
					case 0x0070: {
						return robots.l_nano_esp32;
					}
					case 0x0042: {
						return robots.l_mega;
					}
				}
				break;
			}
			// Darling vendor ID
			case 0x0403: {
				switch (product) {
					case 0x6001: {
						return robots.l_nano;
					}
				}
				break;
			}
			// Espressif vendor ID
			case 0x303a: {
				switch (product) {
					case 0x1001: {
						return robots.l_nano_esp32;
					}
				}
				break;
			}
		}

		return null;
	}

	getLeaphyPort(port: SerialPort | USBDevice): LeaphyPort {
		if ("readable" in port) return port;

		if (port?.vendorId === 1027) return new MockedFTDISerialPort(port);

		return new MockedCDCSerialPort(port);
	}

	async connect(prompt: Prompt) {
		this.status = "connecting";

		const port = await this.requestPort(prompt);
		if (this.port === port) {
			this.status = "ready";
			return port;
		}

		this.port = this.getLeaphyPort(port);
		if ("addEventListener" in this.port) {
			this.port.addEventListener("disconnect", async () => {
				this.reserved = false;
				this.port = undefined;
				this.board = undefined;
				this.status = "disconnected";
			});
		}

		this.board = this.detectBoard(port);

		await this.initPort();

		return port;
	}

	reconnect(): Promise<SerialPort> {
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				navigator.serial.removeEventListener("connect", handler);
				reject(new Error("Reconnect timed out"));
			}, 10_000);

			const handler = async (event: Event) => {
				navigator.serial.removeEventListener("connect", handler);
				clearTimeout(timeout);
				resolve(event.target as SerialPort);
			};

			navigator.serial.addEventListener("connect", handler);
		});
	}

	async reserve() {
		if (this.reserved) throw new Error("Port already reserved");
		this.reserved = true;

		if (this.reader) {
			try {
				await this.reader.cancel();
				// cancel() releases the lock automatically; no need to call releaseLock()
			} catch (e) {
				// Reader may have already been released; try releaseLock() as a fallback
				try {
					this.reader.releaseLock();
				} catch {
					// Already released, ignore
				}
			}
			this.reader = undefined;
		}

		if (this.writer) {
			try {
				this.writer.releaseLock();
			} catch (e) {
				console.error(e);
				// Writer may have already been released, ignore the error
			}
			this.writer = undefined;
		}
	}

	async withPort<T>(fn: (port: LeaphyPort) => Promise<T>): Promise<T> {
		await this.reserve();
		try {
			return await fn(this.port);
		} finally {
			this.release();
			// Restart the read loop so the serial monitor keeps receiving data
			this.initPort().catch(() => {});
		}
	}

	async reset() {
		await this.reserve();
		await this.port.close();
		await this.port.open({ baudRate: 115200 });

		this.release();
		await this.initPort();
	}

	release() {
		this.reserved = false;
	}
}

export default new SerialState();
