import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Advanced from "$components/workspace/advanced/Advanced.svelte";
import Blocks from "$components/workspace/blocks/Blocks.svelte";
import Python from "$components/workspace/python/Python.svelte";
import type { Handle } from "$domain/handles";
import { type RobotDevice, robots } from "$domain/robots";
import MockedFTDISerialPort from "@leaphy-robotics/webusb-ftdi";
import { serialization } from "blockly";
import type { ComponentType } from "svelte";
import { get, writable } from "svelte/store";
import { SerialPort as MockedCDCSerialPort } from "web-serial-polyfill";
import type MicroPythonIO from "../micropython";
import type { IOEventTarget } from "../micropython";
import BlocklyState from "./blockly.svelte";
import PopupState from "./popup.svelte";

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

function createChartState() {
	const { subscribe, update, set } = writable<
		Record<string, { x: Date; y: number }[]>
	>({});

	return {
		subscribe,
		point(chart: string, height: number) {
			update((charts) => {
				if (!charts[chart]) {
					charts[chart] = [];
				}

				charts[chart].push({ x: new Date(), y: height });
				return charts;
			});
		},
		clear() {
			set({});
		},
	};
}
export const charts = createChartState();

let writer: WritableStreamDefaultWriter<Uint8Array>;
function createLogState() {
	const { subscribe, update, set } = writable<LogItem[]>([]);
	let buffer = "";
	let count = 0;

	return {
		subscribe,
		write(content: string) {
			writer.write(new TextEncoder().encode(content));
		},
		clear() {
			charts.clear();
			set([]);
		},
		enqueue(content: Uint8Array) {
			buffer += new TextDecoder().decode(content);

			const items = buffer.split("\n");
			for (const item of items) {
				const [label, value] = item.split(" = ");
				if (!label || !value || Number.isNaN(Number.parseFloat(value)))
					continue;

				charts.point(label, Number.parseFloat(value));
			}
			buffer = items.pop();

			if (items.length > 0) {
				update((log) =>
					[
						...log,
						...items.map((content) => ({
							id: `${count}`,
							date: new Date(),
							content,
						})),
					].slice(-100),
				);
				count++;
				if (count > 100) count = 0;
			}
		},
	};
}
export const log = createLogState();

function createPortState() {
	const { subscribe, set, update } = writable<LeaphyPort>();
	const board = writable<RobotDevice | null | undefined>();

	let reserved = false;
	let reader: ReadableStreamDefaultReader<Uint8Array>;

	let onReady: () => void;
	let onFailure: () => void;
	let showFeedback = false;
	subscribe(async (port) => {
		if (!port || reserved) return;

		if (!port.readable || !port.writable) {
			try {
				await port.open({ baudRate: 115200 });
			} catch (e) {
				set(undefined);
				if (showFeedback) {
					PopupState.open({
						component: ErrorPopup,
						data: {
							title: "ROBOT_RESERVED",
							message: "ROBOT_RESERVED_MESSAGE",
						},
						allowInteraction: false,
					});
				}

				onFailure();
				throw e;
			}
		}
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

	function detectBoard(port: SerialPort | USBDevice) {
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

	function getLeaphyPort(port: SerialPort | USBDevice): LeaphyPort {
		if ("readable" in port) return port;

		if (port?.vendorId === 1027) return new MockedFTDISerialPort(port);

		return new MockedCDCSerialPort(port);
	}

	return {
		subscribe,
		ready: new Promise<void>((resolve, reject) => {
			onReady = resolve;
			onFailure = reject;
		}),
		async requestPort(prompt: Prompt): Promise<SerialPort | USBDevice> {
			showFeedback = prompt === Prompt.ALWAYS;
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
		},
		async connect(prompt: Prompt) {
			this.ready = new Promise<void>((resolve, reject) => {
				onReady = resolve;
				onFailure = reject;
			});

			const port = await this.requestPort(prompt);
			if (get({ subscribe }) === port) return onReady();

			if ("addEventListener" in port) {
				port.addEventListener("disconnect", async () => {
					reserved = false;
					set(undefined);
					board.set(undefined);
					onFailure();
				});
			}
			set(getLeaphyPort(port));
			board.set(detectBoard(port));

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

			await this.ready; // Prevent race condition: port.open not being complete

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
		board,
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

export function tempSave() {
	let saveAddress = get(robot).id;
	switch (get(mode)) {
		case Mode.ADVANCED: {
			saveAddress = "l_cpp";
			break;
		}
		case Mode.PYTHON: {
			saveAddress = "l_micropython";
			break;
		}
	}

	const contentAddress = `${saveAddress}_content`;
	localStorage.setItem(`${saveAddress}_robot`, get(robot).id);

	switch (get(mode)) {
		case Mode.BLOCKS: {
			localStorage.setItem(
				contentAddress,
				JSON.stringify(serialization.workspaces.save(BlocklyState.workspace)),
			);
			break;
		}
		case Mode.ADVANCED: {
			localStorage.setItem(contentAddress, get(code));
			break;
		}
		case Mode.PYTHON: {
			localStorage.setItem(contentAddress, get(code));
			break;
		}
	}
}

window.addEventListener("beforeunload", tempSave);

mode.subscribe(() => {
	PopupState.clear();
	sidePanel.set(null);
});

code.subscribe(() => saveState.set(false));
