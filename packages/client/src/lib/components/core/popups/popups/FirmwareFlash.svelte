<script lang="ts">
import ProgressBar from "$components/ui/ProgressBar.svelte";
import type { Programmer } from "$domain/robots.types";
import PopupState from "$state/popup.svelte";
import SerialState from "$state/serial.svelte";
import base64 from "base64-js";
import { _ } from "svelte-i18n";
import DFU from "../../../../programmers/DFU";
import Windowed from "../Windowed.svelte";
import Process from "./Process.svelte";
import Warning from "./Warning.svelte";
import Espressif_logo from "$assets/Espressif-logo.png";

enum FlashingState {
	SELECT_BOARD = 0,
	RUNNING = 1,
	DONE = 2,
	ERROR = 3,
}

class FirmwareOption {
	name: string;
	icon_url: string;
	is_connected: (manufacturer: number, device: number) => boolean;
	programmer: Programmer;
	firmware_url: string;
}

const dfu = new DFU();

const knownFirmware: FirmwareOption[] = [
	{
		name: "ESP32",
		icon_url: Espressif_logo,
		firmware_url:
			"https://raw.githubusercontent.com/leaphy-robotics/leaphy-firmware/main/micropython/esp32.bin",
		is_connected: (manufacturer: number, device: number) => {
			//TODO: As new platforms are added, make sure they are recognized as valid flash-targets.
			return manufacturer === 0x2341 && device === 0x0070;
		},
		programmer: dfu,
	},
];

let show_all = $state(false);
let process_state: FlashingState = $state(FlashingState.SELECT_BOARD);
let running_progress: number = $state(0);
let latest_message: string = $state("FIRMWARE_ERROR_DEFAULT");

async function downloadImage(
	url: string,
): Promise<Uint8Array<ArrayBuffer> | string> {
	try {
		let response = await fetch(url);
		if (response.status !== 200) {
			return "FIRMWARE_DOWNLOAD_FAILED_RESPONSE";
		}
		let img_bytes = await response.bytes();
		return img_bytes;
	} catch {
		return "FIRMWARE_DOWNLOAD_FAILED_OTHER";
	}
}

async function flash_firmware(
	image: Uint8Array<ArrayBuffer>,
	prog: Programmer,
): Promise<string> {
	let temp_connection = undefined;
	//step 1: ensure USB connection, reserve connection.
	if ((await navigator.usb.getDevices()).length === 0) {
		try {
			const filters = [
				{ vendorId: SerialState.usb_ids[0], productId: SerialState[1] },
			];
			temp_connection = await navigator.usb.requestDevice({ filters });
		} catch {
			return "FIRMWARE_NO_USB_CONNECTION";
		}
	}
	await SerialState.reserve();

	//step 2: let the programmer do its thing.
	try {
		await prog.upload(SerialState.port, {
			sketch: base64.fromByteArray(image),
		});
	} catch (e) {
		if (e.message) {
			return e.message;
		}
		return "FIRMWARE_FLASHING_FAILED";
	} finally {
		//step 3: release reservation, disconnect USB.
		SerialState.release();
		if (temp_connection !== undefined) {
			await temp_connection.close();
		}
	}
}

async function flashFirmware(selected: FirmwareOption) {
	const step_perc = 100 / 4;
	process_state = FlashingState.RUNNING;
	latest_message = "FIRMWARE_RUNNING_VERIFY_CONNECTION";
	console.log(`Flashing firmware for ${selected.name}`);
	if (SerialState.usb_ids === null) {
		process_state = FlashingState.ERROR;
		latest_message = "FIRMWARE_NO_CONNECTION";
		return;
	}
	running_progress += step_perc;
	latest_message = "FIRMWARE_RUNNING_CONFIRM_CHOICE";
	const verify_popup = await PopupState.open({
		component: Warning,
		data: {
			title: "FIRMWARE_CONFIRM_TITLE",
			message: "FIRMWARE_FINAL_WARNING",
			showCancel: true,
		},
		allowInteraction: false,
	});
	if (!(await verify_popup)) {
		latest_message = "FIRMWARE_CANCEL_BUTTON";
		process_state = FlashingState.ERROR;
		return;
	}
	running_progress += step_perc;
	latest_message = "FIRMWARE_RUNNING_DOWNLOAD";

	let download_result = await downloadImage(selected.firmware_url);
	if (
		typeof download_result === "string" ||
		download_result instanceof String
	) {
		latest_message = download_result.toString();
		process_state = FlashingState.ERROR;
		return;
	}
	running_progress += step_perc;
	latest_message = "FIRMWARE_RUNNING_FLASH";

	let flash_result = await flash_firmware(download_result, selected.programmer);
	if (flash_result !== undefined) {
		latest_message = flash_result.toString();
		process_state = FlashingState.ERROR;
		return;
	}
	process_state = FlashingState.DONE;
}
</script>

<Windowed title={$_("FIRMWARE_WINDOW_TITLE")}>
    <div class="content">
        {#if process_state === FlashingState.SELECT_BOARD}
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
        {:else}
			<ProgressBar progress={running_progress}></ProgressBar>
		{/if}
		<div class="text">
			{#if process_state === FlashingState.RUNNING}
				{$_(latest_message)}
				<Process/>
			{:else if process_state === FlashingState.DONE}
				{$_("FIRMWARE_STATE_DONE")}
			{:else if process_state === FlashingState.ERROR}
				{$_("FIRMWARE_STATE_ERROR")}<br/><br/>
				{$_(latest_message)}
			{/if}
		</div>
    </div>
</Windowed>

<style>
    .content {
        min-height: 175px;
        min-width: 250px;
        margin: 8px 10px;
		text-align: center;
		padding:20px;
    }

    .buttonrow {
        width:100%;
        display:flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        & > button {
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
				padding:10%;
            }
            & > div {
                display:inline-block;
                height:2lh;
            }
        }
    }
</style>