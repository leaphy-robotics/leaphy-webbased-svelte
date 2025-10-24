import Bluetooth from "$components/core/popups/popups/Bluetooth.svelte";
import { text } from "$domain/blockly/toolbox";
import BluetoothState from "$state/bluetooth.svelte";
import PopupState from "$state/popup.svelte";
import type { WorkspaceSvg } from "blockly";
// @ts-ignore
import type { FlyoutDefinition } from "blockly/core/utils/toolbox";

export default function bluetooth(workspace: WorkspaceSvg) {
	const blockList: FlyoutDefinition = [
		{
			kind: "button",
			text: BluetoothState.connected
				? "%{BKY_LEAPHY_BLE_CONNECTED}"
				: "%{BKY_LEAPHY_BLE_CONNECT}",
			callbackkey: "ble_connect",
		},
		{
			kind: "block",
			type: "ble_setup",
		},
		{
			kind: "block",
			type: "ble_update",
		},
		{
			kind: "block",
			type: "ble_is_pressed",
		},
	];

	workspace.registerButtonCallback("ble_connect", async () => {
		if (!BluetoothState.connected) {
			return await BluetoothState.connect();
		}

		await PopupState.open({
			component: Bluetooth,
			data: {},
			allowInteraction: false,
		});
	});

	return blockList;
}
