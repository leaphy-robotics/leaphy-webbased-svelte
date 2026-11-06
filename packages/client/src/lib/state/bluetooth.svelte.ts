import {
	decodeUUIDToString,
	SERVICE_UUID,
} from "@leaphy-robotics/leaphy-blocks/src/generators/arduino/bluetooth";
import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import BlocklyState from "$state/blockly.svelte";
import PopupState from "$state/popup.svelte";
import { isBluetoothCancel, track } from "$state/utils";

interface QueueItem {
	characteristic: BluetoothRemoteGATTCharacteristic;
	value: Uint8Array;
}

const RECONNECT_DELAYS = [500, 1000, 2000];

export class BluetoothWriteQueue {
	queue: QueueItem[] = [];
	processing = false;

	async handleQueue() {
		this.processing = true;
		while (this.queue.length > 0) {
			const { characteristic, value } = this.queue.shift();
			try {
				await characteristic.writeValue(value);
			} catch (e) {}
		}
		this.processing = false;
	}

	write(characteristic: BluetoothRemoteGATTCharacteristic, value: Uint8Array) {
		this.queue.push({ characteristic, value });
		if (!this.processing) this.handleQueue().then();
	}
}

class BluetoothState {
	device = $state<BluetoothDevice>();
	server = $state<BluetoothRemoteGATTServer>();
	controlService = $state<BluetoothRemoteGATTService>();
	connected = $state(false);

	keys = new Map<string, BluetoothRemoteGATTCharacteristic>();
	queue = new BluetoothWriteQueue();

	constructor() {
		$effect.root(() => {
			$effect(() => {
				this.keys.clear();

				if (!this.controlService) return;
				this.controlService.getCharacteristics().then((characteristics) => {
					characteristics.forEach((characteristic) => {
						this.keys.set(
							decodeUUIDToString(characteristic.uuid),
							characteristic,
						);
					});
				});
			});
		});
	}

	updateSelection() {
		BlocklyState.workspace.refreshToolboxSelection();
	}

	press(code: string) {
		if (!this.keys.has(code)) return;

		this.queue.write(this.keys.get(code), new Uint8Array([0x01]));
	}

	release(code: string) {
		if (!this.keys.has(code)) return;

		this.queue.write(this.keys.get(code), new Uint8Array([0x00]));
	}

	async setup() {
		this.server = await this.device.gatt.connect();
		this.controlService = await this.server.getPrimaryService(SERVICE_UUID);
		this.connected = true;
		this.updateSelection();
	}

	private async handleDisconnect(device: BluetoothDevice) {
		this.connected = false;
		this.server = null;
		this.controlService = null;
		this.updateSelection();

		// Stop after a few attempts. The connect button stays available to try again.
		for (const delay of RECONNECT_DELAYS) {
			await new Promise((resolve) => setTimeout(resolve, delay));
			if (this.device !== device) return;

			try {
				await this.setup();
				return;
			} catch (e) {
				console.warn("Bluetooth reconnect failed", e);
			}
		}
	}

	private showConnectionError() {
		PopupState.open({
			component: ErrorPopup,
			data: {
				title: "BLUETOOTH_CONNECT_FAILED_TITLE",
				message: "BLUETOOTH_CONNECT_FAILED_MESSAGE",
			},
			allowInteraction: false,
		});
	}

	async connect() {
		this.connected = false;
		if (!("bluetooth" in navigator)) {
			await PopupState.open({
				component: ErrorPopup,
				data: {
					title: "NO_BLUETOOTH_TITLE",
					message: "NO_BLUETOOTH_MESSAGE",
				},
				allowInteraction: false,
			});
			return;
		}

		try {
			const device = await navigator.bluetooth.requestDevice({
				filters: [{ services: [SERVICE_UUID] }],
			});
			this.device = device;
			device.addEventListener("gattserverdisconnected", () =>
				this.handleDisconnect(device),
			);

			await this.setup();
		} catch (e) {
			if (isBluetoothCancel(e)) return;

			console.warn("Unable to connect over Bluetooth", e);
			this.showConnectionError();
		}
	}
}

export default new BluetoothState();
