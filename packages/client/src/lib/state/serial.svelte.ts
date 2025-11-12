import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import { type RobotDevice, robots } from "$domain/robots";
import PopupState from "$state/popup.svelte";
import { track } from "$state/utils";
import MockedFTDISerialPort from "@leaphy-robotics/webusb-ftdi";
import { SerialPort as MockedCDCSerialPort } from "web-serial-polyfill";

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

export const SUPPORTED_VENDOR_IDS = [0x1a86, 9025, 2341, 0x0403, 0x2e8a];

class LogState {
	log = $state<LogItem[]>([]);
	charts = $state<Record<string, { x: Date; y: number }[]>>({});

	private buffer = "";
	private count = 0;

	constructor(private serial: SerialState) {}

	write(content: string) {
		this.serial.writer.write(new TextEncoder().encode(content)).then();
	}

	clear() {
		this.charts = {};
		this.log = [];
	}

	getID() {
		if (this.count > 100) this.count = 0;
		return `${this.count++}`;
	}

	enqueue(content: Uint8Array) {
		this.buffer += new TextDecoder().decode(content);

		const items = this.buffer.split("\n");
		for (const item of items) {
			const [label, value] = item.split(" = ");
			if (!label || !value || Number.isNaN(Number.parseFloat(value))) continue;

			this.point(label, Number.parseFloat(value));
		}
		this.buffer = items.pop();

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

class SerialState {
	port = $state<LeaphyPort>();
	board = $state<RobotDevice | null>();
	ready = $state(
		new Promise<void>((resolve, reject) => {
			this.onReady = resolve;
			this.onFailure = reject;
		}),
	);

	reserved = $state(false);
	reader: ReadableStreamDefaultReader<Uint8Array>;
	writer: WritableStreamDefaultWriter<Uint8Array>;

	onReady: () => void;
	onFailure: () => void;
	showFeedback = false;

	log = new LogState(this);

	constructor() {
		$effect.root(() => {
			$effect(() => {
				track(this.port);
				this.initPort().then();
			});
		});
	}

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

				this.onFailure();
				throw e;
			}
		}
		if (this.port.readable.locked || this.port.writable.locked) return;

		this.writer = this.port.writable.getWriter();
		this.reader = this.port.readable.getReader();
		this.onReady();

		while (this.port.readable && this.port.writable) {
			const { done, value } = await this.reader.read();
			if (done) break;

			this.log.enqueue(value);
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
					case 0x005e: {
						return robots.l_nano_rp2040;
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
		this.ready = new Promise<void>((resolve, reject) => {
			this.onReady = resolve;
			this.onFailure = reject;
		});

		const port = await this.requestPort(prompt);
		if (this.port === port) return this.onReady();

		this.port = this.getLeaphyPort(port);
		if ("addEventListener" in this.port) {
			this.port.addEventListener("disconnect", async () => {
				this.reserved = false;
				this.port = undefined;
				this.board = undefined;
				this.onFailure();
			});
		}

		this.board = this.detectBoard(port);

		return port;
	}

	reconnect() {
		return new Promise((resolve, reject) => {
			let attempts = 0;
			const interval = setInterval(async () => {
				if (++attempts > 200) {
					clearInterval(interval);
					reject("Failed to reconnect");
				}

				try {
					const port = await this.connect(Prompt.NEVER);
					if (port) {
						clearInterval(interval);
						resolve(port);
					}
				} catch (e) {}
			}, 50);
		});
	}

	async reserve() {
		this.reserved = true;

		await this.ready; // Prevent race condition: port.open not being complete

		const serialPort = this.port;
		if (serialPort.readable.locked) {
			await this.reader.cancel();
			this.reader.releaseLock();
		}

		if (serialPort.writable.locked) {
			this.writer.releaseLock();
		}
	}

	release() {
		this.reserved = false;
	}
}

export default new SerialState();
