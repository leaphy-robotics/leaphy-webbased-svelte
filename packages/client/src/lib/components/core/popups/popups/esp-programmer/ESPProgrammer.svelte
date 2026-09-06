<script lang="ts">
import {
	ESPLoader,
	type FlashOptions,
	type LoaderOptions,
	Transport,
} from "esptool-js";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import BlinkInoBin from "$assets/esp-reset/blink.ino.bin?url";
import BlinkInoBootloaderBin from "$assets/esp-reset/blink.ino.bootloader.bin?url";
import BlinkInoPartitionsBin from "$assets/esp-reset/blink.ino.partitions.bin?url";
import BootApp0Bin from "$assets/esp-reset/boot_app0.bin?url";
import NoraRecoveryBin from "$assets/esp-reset/nora_recovery.ino.bin?url";
import Button from "$components/ui/Button.svelte";
import ProgressBar from "$components/ui/ProgressBar.svelte";
import type { PopupState } from "$state/popup.svelte";
import SerialState from "$state/serial.svelte";
import WorkspaceState from "$state/workspace.svelte";
import Windowed from "../../Windowed.svelte";
import Visualization from "./Visualization.svelte";

type Step = "RESET_TWICE" | "FLASHING" | "RESET" | "ERROR";

let step = $state<Step>("RESET_TWICE");
const popupState = getContext<PopupState>("state");

let port = $state<SerialPort | null>(null);
let transport = $state<Transport | null>(null);
let loader = $state<ESPLoader | null>(null);
let progress = $state(0);
let busy = $state(false);
let errorDetail = $state<string | null>(null);

function log(line: string) {
	WorkspaceState.uploadLog.push(line);
}

function createLoader(loaderTransport: Transport): ESPLoader {
	return new ESPLoader({
		transport: loaderTransport,
		baudrate: 921600,
		romBaudrate: 921600,
		terminal: {
			clean: () => {},
			writeLine: log,
			write: log,
		},
		debugLogging: true,
	});
}

function isUserCancel(e: unknown): boolean {
	return e instanceof DOMException && e.name === "NotFoundError";
}

async function fetchFirmware(url: string): Promise<Uint8Array> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to download firmware (${response.status})`);
	}
	return new Uint8Array(await response.arrayBuffer());
}

async function cleanup() {
	if (transport) {
		try {
			await transport.disconnect();
		} catch {
			// Port may already be closed or gone after a reset
		}
	}
	transport = null;
	loader = null;
	port = null;
}

async function selectPort() {
	if (busy) return;
	busy = true;
	errorDetail = null;

	let reserved = false;
	try {
		await SerialState.reserve();
		reserved = true;

		const firstPort = await navigator.serial.requestPort({
			filters: [
				{ usbProductId: 112, usbVendorId: 9025 },
				{ usbProductId: 0x1001, usbVendorId: 0x303a },
			],
		});

		if (firstPort.getInfo().usbVendorId === 9025) {
			// Arduino Nano ESP32: this first connection attempt kicks the board
			// into the ROM bootloader. The board re-enumerates as a different
			// USB device, so this attempt is expected to fail.
			if (firstPort.readable) {
				try {
					await firstPort.close();
				} catch {
					// Already closed
				}
			}
			const firstTransport = new Transport(firstPort, true);
			const firstLoader = createLoader(firstTransport);
			try {
				await firstLoader.main();
			} catch (e) {
				log(`Expected disconnect while entering bootloader: ${e}`);
			} finally {
				try {
					await firstTransport.disconnect();
				} catch {
					// Device is gone after re-enumeration
				}
			}

			port = await navigator.serial.requestPort({
				filters: [{ usbProductId: 4097, usbVendorId: 12346 }],
			});
		} else {
			port = firstPort;
		}

		transport = new Transport(port, true);
		loader = createLoader(transport);
		await loader.main();
		await flash();
	} catch (e) {
		if (isUserCancel(e)) {
			// User closed the port chooser; go back to the start silently
			step = "RESET_TWICE";
		} else {
			console.error(e);
			log(`ESP recovery failed: ${e}`);
			errorDetail = e instanceof Error ? e.message : String(e);
			step = "ERROR";
		}
	} finally {
		await cleanup();
		if (reserved) {
			SerialState.release();
			// Restart the read loop so the serial monitor keeps receiving data
			SerialState.initPort().catch(() => {});
		}
		busy = false;
	}
}

async function flash() {
	if (!loader) return;

	step = "FLASHING";
	progress = 0;
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
				data: await fetchFirmware(file.url),
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

function retry() {
	errorDetail = null;
	progress = 0;
	step = "RESET_TWICE";
}
</script>

<Windowed title={$_("ESP_PROGRAMMER")}>
	<div class="p-5 flex flex-col items-center text-center gap-5 w-[500px]">
		<h1 class="m-0 text-2xl font-bold">{$_(`ESP_PROGRAMMER_${step}`)}</h1>
		<span>{$_(`ESP_PROGRAMMER_${step}_DESCRIPTION`)}</span>
		{#if step === "RESET_TWICE"}
			<Visualization program="RESET_TWICE" />
			<Button name={$_("CHOOSE_ROBOT")} mode="primary" disabled={busy} onclick={() => selectPort()} />
		{/if}
		{#if step === "FLASHING"}
			<ProgressBar {progress} />
		{/if}
		{#if step === "RESET"}
			<Visualization program="RESET" />
			<Button name={$_("DONE")} mode="primary" onclick={() => popupState.close()} />
		{/if}
		{#if step === "ERROR"}
			{#if errorDetail}
				<code class="text-sm text-red-600 break-words max-w-full">{errorDetail}</code>
			{/if}
			<Button name={$_("ESP_PROGRAMMER_TRY_AGAIN")} mode="primary" onclick={retry} />
		{/if}
	</div>
</Windowed>
