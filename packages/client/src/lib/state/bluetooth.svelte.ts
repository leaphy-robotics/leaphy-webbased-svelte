import BlocklyState from "$state/blockly.svelte";
import { track } from "$state/utils";
import { decodeUUIDToString } from "@leaphy-robotics/leaphy-blocks/src/generators/arduino/bluetooth";

interface QueueItem {
	characteristic: BluetoothRemoteGATTCharacteristic;
	value: Uint8Array;
}

class BluetoothWriteQueue {
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
		this.controlService = await this.server.getPrimaryService(
			"33c7afab-1609-4a7e-861d-9cfbefb33541",
		);
		this.connected = true;
		this.updateSelection();
	}

	async connect() {
		this.connected = false;

		this.device = await navigator.bluetooth.requestDevice({
			filters: [{ services: ["33c7afab-1609-4a7e-861d-9cfbefb33541"] }],
		});
		this.device.addEventListener("gattserverdisconnected", async () => {
			this.connected = false;
			this.server = null;
			this.controlService = null;

			this.updateSelection();
			await this.setup();
		});

		await this.setup();
	}
}

export default new BluetoothState();
