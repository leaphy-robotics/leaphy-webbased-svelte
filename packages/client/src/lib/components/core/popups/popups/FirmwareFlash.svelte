<script lang="ts">
import ProgressBar from "$components/ui/ProgressBar.svelte";
import type { Programmer } from "$domain/robots.types";
import PopupState from "$state/popup.svelte";
import SerialState from "$state/serial.svelte";
import { _ } from "svelte-i18n";
import DFU from "../../../../programmers/DFU";
import Pico from "../../../../programmers/Pico";
import Windowed from "../Windowed.svelte";
import ImageDownloader from "./ImageDownloader.svelte";
import ImageFlasher from "./ImageFlasher.svelte";
import Warning from "./Warning.svelte";

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
const picotool = new Pico();

const knownFirmware: FirmwareOption[] = [
	{
		name: "Raspberry RP2040",
		icon_url: "",
		firmware_url:
			"https://raw.githubusercontent.com/leaphy-robotics/leaphy-firmware/main/micropython/firmware.uf2",
		is_connected: (manufacturer: number, device: number) => {
			return manufacturer === 0x2341 && device === 0x025e;
		},
		programmer: picotool,
	},
	{
		name: "ESP32",
		icon_url: "",
		firmware_url:
			"https://raw.githubusercontent.com/leaphy-robotics/leaphy-firmware/main/micropython/esp32.bin",
		is_connected: (manufacturer: number, device: number) => {
			return manufacturer === 0x2341 && device === 0x0070;
		},
		programmer: dfu,
	},
];

let show_all = $state(false);
let progress: FlashingState = $state(FlashingState.SELECT_BOARD);
let running_progress: number = $state(0);
let latest_error: string = $state("FIRMWARE_ERROR_DEFAULT");

async function flashFirmware(selected: FirmwareOption) {
	const step_perc = 100 / 4;
	progress = FlashingState.RUNNING;
	console.log(`Flashing firmware for ${selected.name}`);
	if (SerialState.usb_ids === null) {
		progress = FlashingState.ERROR;
		latest_error = "FIRMWARE_NO_CONNECTION";
		return;
	}
	running_progress += step_perc;
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
		latest_error = "FIRMWARE_CANCEL_BUTTON";
		progress = FlashingState.ERROR;
		return;
	}
	running_progress += step_perc;

	let download_result = await PopupState.open({
		component: ImageDownloader,
		data: {
			url: selected.firmware_url,
		},
		allowInteraction: false,
		position: {
			x: 0,
			y: 100,
		},
	});
	if (
		typeof download_result === "string" ||
		download_result instanceof String
	) {
		latest_error = download_result.toString();
		progress = FlashingState.ERROR;
		return;
	}
	if (download_result === undefined) {
		latest_error = "FIRMWARE_CANCELLED";
		progress = FlashingState.ERROR;
		return;
	}
	running_progress += step_perc;

	let flash_result = await PopupState.open({
		component: ImageFlasher,
		data: {
			prog: selected.programmer,
			image: download_result,
		},
		allowInteraction: false,
		position: {
			x: 0,
			y: 100,
		},
	});
	if (typeof flash_result === "string" || flash_result instanceof String) {
		latest_error = flash_result.toString();
		progress = FlashingState.ERROR;
		return;
	}
	if (flash_result === undefined) {
		latest_error = "FIRMWARE_CANCELLED";
		progress = FlashingState.ERROR;
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
        {:else}
			<ProgressBar progress={running_progress}></ProgressBar>
		{/if}
		<div class="text">
			{#if progress === FlashingState.DONE}
				{$_("FIRMWARE_STATE_DONE")}
			{:else if progress === FlashingState.ERROR}
				{$_("FIRMWARE_STATE_ERROR")}<br/><br/>
				{$_(latest_error)}
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