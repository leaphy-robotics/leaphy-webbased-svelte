import Advanced from "$components/workspace/advanced/Advanced.svelte";
import Blocks from "$components/workspace/blocks/Blocks.svelte";
import Python from "$components/workspace/python/Python.svelte";
import type { Handle } from "$domain/handles";
import type { RobotDevice } from "$domain/robots";
import MockedFTDISerialPort from "@leaphy-robotics/webusb-ftdi";
import type { ComponentType } from "svelte";
import { get, writable } from "svelte/store";
import { SerialPort as MockedCDCSerialPort } from "web-serial-polyfill";
import type MicroPythonIO from "../micropython";
import type { IOEventTarget } from "../micropython";

export type LeaphyPort =
	| SerialPort
	| MockedCDCSerialPort
	| MockedFTDISerialPort;

export const Mode = {
	BLOCKS: Blocks,
	ADVANCED: Advanced,
	PYTHON: Python,
};

export enum Prompt {
	NEVER = 0,
	MAYBE = 1,
	ALWAYS = 2,
}

export class ConnectionFailedError {}

interface LogItem {
	id: string;
	date: Date;
	content: string;
}

export const SUPPORTED_VENDOR_IDS = [0x1a86, 9025, 2341, 0x0403, 0x2e8a];

let writer: WritableStreamDefaultWriter<Uint8Array>;
function createLogState() {
	const { subscribe, update } = writable<LogItem[]>([]);
	let buffer = "";

	return {
		subscribe,
		write(content: string) {
			writer.write(new TextEncoder().encode(content));
		},
		enqueue(content: Uint8Array) {
			buffer += new TextDecoder().decode(content);

			const items = buffer.split("\n");
			buffer = items.pop();

			if (items.length > 0) {
				update((log) =>
					[
						...log,
						...items.map((content) => ({
							id: crypto.randomUUID(),
							date: new Date(),
							content,
						})),
					].slice(-100),
				);
			}
		},
	};
}
export const log = createLogState();

function createPortState() {
	const { subscribe, update } = writable<LeaphyPort>();

	let reserved = false;
	let reader: ReadableStreamDefaultReader<Uint8Array>;

	let onReady: () => void;
	subscribe(async (port) => {
		if (!port || reserved) return;
		console.log(1)
		if (!port.readable || !port.writable) {
			console.log(2)
			await port.open({ baudRate: 115200 });
		}
		console.log(3)
		if (port.readable.locked || port.writable.locked) return;

		writer = port.writable.getWriter();
		reader = port.readable.getReader();
		onReady();

		while (port.readable && port.writable) {
			const { done, value } = await reader.read();
			if (done) break;

			log.enqueue(value);
		}
	});

	return {
		subscribe,
		ready: new Promise<void>((resolve) => (onReady = resolve)),
		async requestPort(prompt: Prompt) {
			if (navigator.serial) {
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

					if (device?.vendorId === 1027)
						return new MockedFTDISerialPort(device);
					if (device) return new MockedCDCSerialPort(device);
				}
				if (prompt === Prompt.NEVER) throw new ConnectionFailedError();

				const device = await navigator.usb.requestDevice({
					filters: SUPPORTED_VENDOR_IDS.map((vendor) => ({
						vendorId: vendor,
					})),
				});
				if (device?.vendorId === 1027) return new MockedFTDISerialPort(device);
				if (device) return new MockedCDCSerialPort(device);

				throw new ConnectionFailedError();
			}
		},
		async connect(prompt: Prompt) {
			this.ready = new Promise<void>((resolve) => (onReady = resolve));
			const port = await this.requestPort(prompt);
			console.log(port)
			update(() => port);
			return port;
		},
		reconnect() {
			return new Promise((resolve, reject) => {
				let attempts = 0;
				const interval = setInterval(async () => {
					if (++attempts > 200) {
						clearInterval(interval);
						reject("Failed to reconnect");
					}

					const port = await this.connect(Prompt.NEVER);
					if (port) {
						clearInterval(interval);
						resolve(port);
					}
				}, 50);
			});
		},
		async reserve() {
			reserved = true;

			const serialPort = get(port);
			if (serialPort.readable.locked) {
				await reader.cancel();
				reader.releaseLock();
			}

			if (serialPort.writable.locked) {
				writer.releaseLock();
			}
		},
		release() {
			reserved = false;
			update((port) => port);
		},
	};
}
export const port = createPortState();

function createUploadLog() {
	const { subscribe, update, set } = writable<string[]>([]);

	return {
		subscribe,
		set,
		add(item: string) {
			update((log) => [...log, item]);
		},
		clear() {
			update(() => []);
		},
	};
}
export const uploadLog = createUploadLog();
export const sidePanel = writable<ComponentType | undefined>(undefined);
export const handle = writable<Handle | undefined>(undefined);
export const robot = writable<RobotDevice>();
export const mode = writable<ComponentType>(Mode.BLOCKS);
export const code = writable<string>("");
export const saveState = writable<boolean>(true);
export const installed = writable<[string, string][]>([]);
export const microPythonIO = writable<MicroPythonIO | undefined>();
export const microPythonRun = writable<IOEventTarget | undefined>();

code.subscribe(() => saveState.set(false));
