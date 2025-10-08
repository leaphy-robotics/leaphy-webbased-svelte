<script lang="ts">
import {_} from "svelte-i18n";
import {getContext} from "svelte";
import Windowed from "../Windowed.svelte";
import SerialState from "$state/serial.svelte";

enum FlashingState {
    SELECT_BOARD,
    VERIFY_OK,
    DOWNLOAD_FW,
    FLASH_FW,
    DONE,
    ERROR
}

class FirmwareOption {
    name:string;
    icon_url:string;
    is_connected:(manufacturer:number,device:number) => boolean;
    firmware_url:string;
}

const knownFirmware:FirmwareOption[] = [
    {
        name:"Raspberry RP2040",
        icon_url:"",
        firmware_url:"https://raw.githubusercontent.com/leaphy-robotics/leaphy-firmware/main/micropython/firmware.uf2",
        is_connected:(manufacturer:number, device:number) => {
            return manufacturer == 0x2341 && device == 0x025e;
        }
    },
    {
        name:"ESP32",
        icon_url:"",
        firmware_url:"https://raw.githubusercontent.com/leaphy-robotics/leaphy-firmware/main/micropython/esp32.bin",
        is_connected:(manufacturer:number, device:number) => {
            return manufacturer == 0x2341 && device == 0x0070;
        }
    }
]

let show_all = $state(false);
let progress:FlashingState = $state(FlashingState.SELECT_BOARD);
let confirmed:Promise<boolean> = $state();

async function flashFirmware(selected:FirmwareOption) {
    //todo: download and flash the firmware.
    console.log(`Flashing firmware for ${selected.name}`);
    if (SerialState.port === null) {
        progress = FlashingState.ERROR;
        return;
    }
    progress = FlashingState.DOWNLOAD_FW;
    await new Promise((resolve) => {setTimeout(resolve,1000)});
    progress = FlashingState.FLASH_FW;
    await new Promise((resolve) => {setTimeout(resolve,1000)});
    if (Math.random() > 0.5)
        {progress = FlashingState.DONE;}
    else
        {progress = FlashingState.ERROR;}
}

</script>

<Windowed title={$_("FLASH_FIRMWARE_TITLE")}>
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
                Laat alle firmware-opties zien
            </label>
        {:else if progress === FlashingState.VERIFY_OK}
            Je staat op het punt de firmware op je bord te installeren.<br/>
            Weet je zeker dat je het juiste bord en de juiste firmware hebt gekozen?<br/>
            ja/nee
        {:else if progress === FlashingState.DOWNLOAD_FW}
            downloaden...
        {:else if progress === FlashingState.FLASH_FW}
            flashen...
        {:else if progress === FlashingState.DONE}
            Klaar!
        {:else if progress === FlashingState.ERROR}
            Er is iets fout gegaan.
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