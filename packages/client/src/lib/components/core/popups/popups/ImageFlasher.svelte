<script lang="ts">
import type { Programmer } from "$domain/robots.types";
import type { PopupState } from "$state/popup.svelte";
import SerialState from "$state/serial.svelte";
import base64 from "base64-js";
import { getContext, onMount } from "svelte";
import { _ } from "svelte-i18n";
import Windowed from "../Windowed.svelte";
import Process from "./Process.svelte";

interface Props {
	prog: Programmer;
	image: Uint8Array<ArrayBuffer>;
}

const popupState = getContext<PopupState>("state");
const { prog, image }: Props = $props();

async function flash_firmware() {
	let temp_connection = undefined;
	//step 1: ensure USB connection, reserve connection.
	if ((await navigator.usb.getDevices()).length === 0) {
		try {
			const filters = [
				{ vendorId: SerialState.usb_ids[0], productId: SerialState[1] },
			];
			temp_connection = await navigator.usb.requestDevice({ filters });
		} catch {
			popupState.close("FIRMWARE_NO_USB_CONNECTION");
		}
	}
	await SerialState.reserve();

	//step 2: let the programmer do its thing.
	try {
		await prog.upload(SerialState.port, {
			sketch: base64.fromByteArray(image),
		});
	} catch {
		popupState.close("FIRMWARE_FLASHING_FAILED");
	} finally {
		//step 3: release reservation, disconnect USB.
		SerialState.release();
		if (temp_connection !== undefined) {
			await temp_connection.close();
		}
	}
}

onMount(flash_firmware);
</script>

<Windowed title={$_("FIRMWARE_FLASH_TITLE") }>
    <div>{$_("FIRMWARE_FLASH_MESSAGE")}</div>
    <Process/>
</Windowed>