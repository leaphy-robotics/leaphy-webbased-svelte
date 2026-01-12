<script lang="ts">
import Button from "$components/ui/Button.svelte";
import ProgressBar from "$components/ui/ProgressBar.svelte";
import type { PopupState } from "$state/popup.svelte";
import SerialState from "$state/serial.svelte";
import WorkspaceState from "$state/workspace.svelte";
import {
	ESPLoader,
	type FlashOptions,
	type LoaderOptions,
	Transport,
} from "esptool-js";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import Windowed from "../../Windowed.svelte";

import BlinkInoBin from "$assets/esp-reset/blink.ino.bin?url";
import BlinkInoBootloaderBin from "$assets/esp-reset/blink.ino.bootloader.bin?url";
import BlinkInoPartitionsBin from "$assets/esp-reset/blink.ino.partitions.bin?url";
import BootApp0Bin from "$assets/esp-reset/boot_app0.bin?url";
import NoraRecoveryBin from "$assets/esp-reset/nora_recovery.ino.bin?url";
import Visualization from "./Visualization.svelte";

type Step = "RESET_TWICE" | "FLASHING" | "RESET";

let step = $state<Step>("RESET_TWICE");
const popupState = getContext<PopupState>("state");

let port = $state<SerialPort | null>(null);
let transport = $state<Transport | null>(null);
let loader = $state<ESPLoader | null>(null);
let progress = $state(0);

async function fetchAsBinaryString(url: string): Promise<string> {
	const response = await fetch(url);
	const arrayBuffer = await response.arrayBuffer();
	const uint8Array = new Uint8Array(arrayBuffer);

	// Convert to binary string
	let binaryString = "";
	for (let i = 0; i < uint8Array.length; i++) {
		binaryString += String.fromCharCode(uint8Array[i]);
	}
	return binaryString;
}

async function selectPort() {
	await SerialState.reserve();

	// First request will fail, but it will create the correct port
	const firstPort =
		(await navigator.serial.requestPort({
			filters: [{ usbProductId: 112, usbVendorId: 9025 }],
		})) || null;
	try {
		await firstPort.close();
	} catch (e) {
		console.error(e);
	}
	const firstTransport = new Transport(firstPort, true);
	const firstLoader = new ESPLoader({
		transport: firstTransport,
		baudrate: 921600,
		romBaudrate: 921600,
		terminal: {
			clean: () => {},
			writeLine: (line: string) => {
				WorkspaceState.uploadLog.push(line);
			},
			write: (data: string) => {
				WorkspaceState.uploadLog.push(data);
			},
		},
		debugLogging: true,
	});
	try {
		await firstLoader.main();
	} catch (e) {
		console.error(e);
	}

	port =
		(await navigator.serial.requestPort({
			filters: [{ usbProductId: 4097, usbVendorId: 12346 }],
		})) || null;

	if (port) {
		transport = new Transport(port, true);
		loader = new ESPLoader({
			transport,
			baudrate: 921600,
			romBaudrate: 921600,
			terminal: {
				clean: () => {},
				writeLine: (line: string) => {
					WorkspaceState.uploadLog.push(line);
				},
				write: (data: string) => {
					WorkspaceState.uploadLog.push(data);
				},
			},
			debugLogging: true,
		});
		await loader.main();
		await flash();
	}
}

async function flash() {
	if (!loader) return;

	step = "FLASHING";
	const fileUrls = [
		{ url: BlinkInoBootloaderBin, offset: 0x0 },
		{ url: BlinkInoPartitionsBin, offset: 0x8000 },
		{ url: BootApp0Bin, offset: 0xe000 },
		{ url: NoraRecoveryBin, offset: 0xf70000 },
		{ url: BlinkInoBin, offset: 0x10000 },
	];
	const files = await Promise.all(
		fileUrls.map(async (file) => {
			return {
				data: await fetchAsBinaryString(file.url),
				address: file.offset,
			};
		}),
	);

	await loader.writeFlash({
		fileArray: files,
		eraseAll: true,
		compress: true,
		flashSize: "keep",
		flashMode: "keep",
		flashFreq: "keep",
		reportProgress: (fileIndex: number, written: number, total: number) => {
			progress = ((fileIndex + written / total) / files.length) * 100;
		},
	});
	step = "RESET";
}
</script>

<Windowed title={$_("ESP_PROGRAMMER")}>
    <div class="content">
        <h1>{$_(`ESP_PROGRAMMER_${step}`)}</h1>
        <span>{$_(`ESP_PROGRAMMER_${step}_DESCRIPTION`)}</span>
        {#if step === "RESET_TWICE"}
            <Visualization program="RESET_TWICE" />
            <Button name={$_("CHOOSE_ROBOT")} mode="primary" onclick={() => selectPort()} />
        {/if}
        {#if step === "FLASHING"}
            <ProgressBar {progress} />
        {/if}
        {#if step === "RESET"}
            <Visualization program="RESET" />
            <Button name={$_("DONE")} mode="primary" onclick={() => popupState.close()} />
        {/if}
    </div>
</Windowed>

<style>
    .content {
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 20px;
        width: 500px;
    }

    h1 {
        margin: 0;
    }
</style>
