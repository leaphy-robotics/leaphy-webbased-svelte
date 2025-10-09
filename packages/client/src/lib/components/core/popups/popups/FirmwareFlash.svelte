<script lang="ts">
import SerialState, { type LeaphyPort } from "$state/serial.svelte";
import base64 from "base64-js";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import DFU from "../../../../programmers/DFU";
import Windowed from "../Windowed.svelte";

enum FlashingState {
	SELECT_BOARD = 0,
	VERIFY_OK = 1,
	DOWNLOAD_FW = 2,
	FLASH_FW = 3,
	DONE = 4,
	ERROR = 5,
}

class FirmwareOption {
	name: string;
	icon_url: string;
	is_connected: (manufacturer: number, device: number) => boolean;
	firmware_url: string;
}

const knownFirmware: FirmwareOption[] = [
	{
		name: "Raspberry RP2040",
		icon_url: "",
		firmware_url:
			"https://raw.githubusercontent.com/leaphy-robotics/leaphy-firmware/main/micropython/firmware.uf2",
		is_connected: (manufacturer: number, device: number) => {
			return manufacturer === 0x2341 && device === 0x025e;
		},
	},
	{
		name: "ESP32",
		icon_url: "",
		firmware_url:
			"https://raw.githubusercontent.com/leaphy-robotics/leaphy-firmware/main/micropython/esp32.bin",
		is_connected: (manufacturer: number, device: number) => {
			return manufacturer === 0x2341 && device === 0x0070;
		},
	},
];

let show_all = $state(false);
let progress: FlashingState = $state(FlashingState.SELECT_BOARD);

let onAccept: () => void;
let onReject: () => void;
let accepted_button: Promise<void> = $state(
	new Promise<void>((resolve, reject) => {
		onAccept = resolve;
		onReject = reject;
	}),
);

let latest_error: string = $state("FIRMWARE_ERROR_DEFAULT");

async function flashFirmware(selected: FirmwareOption) {
	//todo: download and flash the firmware.
	console.log(`Flashing firmware for ${selected.name}`);
	if (SerialState.usb_ids === null) {
		progress = FlashingState.ERROR;
		latest_error = "FIRMWARE_NO_CONNECTION";
		return;
	}
	progress = FlashingState.VERIFY_OK;
	try {
		await accepted_button;
	} catch {
		latest_error = "FIRMWARE_CANCEL_BUTTON";
		progress = FlashingState.ERROR;
		return;
	}

	progress = FlashingState.DOWNLOAD_FW;
	let image_data: string = null;
	try {
		let response = await fetch(selected.firmware_url);
		if (response.status !== 200) {
			latest_error = "FIRMWARE_DOWNLOAD_FAILED_RESPONSE";
			progress = FlashingState.ERROR;
			return;
		}
		//Conversion needed since existing DFU utility expects a string.
		image_data = base64.fromByteArray(await response.bytes());
	} catch {
		latest_error = "FIRMWARE_DOWNLOAD_FAILED_OTHER";
		progress = FlashingState.ERROR;
		return;
	}

	progress = FlashingState.FLASH_FW;
	//The DFU utility expects that specifically a USB device is connected.
	//SerialState only uses USB as a fallback if no serial devices are found.
	//Will be an unexpected interaction for the user, but should work.
	if ((await navigator.usb.getDevices()).length === 0) {
		try {
			const filters = [
				{ vendorId: SerialState.usb_ids[0], productId: SerialState[1] },
			];
			await navigator.usb.requestDevice({ filters });
		} catch {
			latest_error = "FIRMWARE_NO_USB_CONNECTION";
			progress = FlashingState.ERROR;
			return;
		}
	}

	const dfu = new DFU();
	try {
		await dfu.upload(SerialState.port, { sketch: image_data });
	} catch (err) {
		latest_error = "FIRMWARE_FLASHING_FAILED";
		progress = FlashingState.ERROR;
		console.error(err);
		return;
	}

	progress = FlashingState.DONE;
}
</script>

<Windowed title={$_("FIRMWARE_WINDOW_TITLE")}>
    <div class="content">
        {#if progress === FlashingState.SELECT_BOARD}
            <div class="buttonrow">
                {#each knownFirmware as firmware}
                    {#if show_all || (SerialState.usb_ids !== null && firmware.is_connected(SerialState.usb_ids[0],SerialState.usb_ids[1]))}
                        <button onclick={() => flashFirmware(firmware)}>
                                <img src={firmware.icon_url} alt="Icon for {firmware.name}" />
                                <div>{firmware.name}</div>
                        </button>
                    {/if}
                {/each}
            </div><br/>
            <label>
                <input type="checkbox" bind:checked={show_all}/>
                {$_("FIRMWARE_SHOW_ALL_OPTIONS")}
            </label>
        {:else if progress === FlashingState.VERIFY_OK}
            {$_("FIRMWARE_FINAL_WARNING")}
            <button onclick={onAccept}>{$_("FIRMWARE_BUTTON_CONFIRM")}</button>
            <button onclick={onReject}>{$_("FIRMWARE_BUTTON_CANCEL")}</button>
        {:else if progress === FlashingState.DOWNLOAD_FW}
            {$_("FIRMWARE_STATE_DOWNLOADING")}
        {:else if progress === FlashingState.FLASH_FW}
            {$_("FIRMWARE_STATE_FLASHING")}
        {:else if progress === FlashingState.DONE}
            {$_("FIRMWARE_STATE_DONE")}
        {:else if progress === FlashingState.ERROR}
            {$_("FIRMWARE_STATE_ERROR")}<br/><br/>
            {$_(latest_error)}
        {/if}
    </div>
</Windowed>

<style>
    .content {
        min-height: 175px;
        min-width: 250px;
        margin: 8px 10px;
    }

    .buttonrow {
        width:100%;
        display:flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        & > button {
            background-color:red;
            height:max-content;
            width:120px;
            padding-bottom: 4px;
            display:grid;
            row-gap:4px;
            grid-template-columns: auto;
            grid-template-rows:auto auto;
            & > img {
                display:inline-block;
                height:100px;
                width:100px;
            }
            & > div {
                display:inline-block;
                height:2lh;
            }
        }
    }
</style>