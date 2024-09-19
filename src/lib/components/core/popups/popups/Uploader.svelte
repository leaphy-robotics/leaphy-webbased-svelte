<script lang="ts">
import { _ } from "svelte-i18n";

import DriverInstall from "$components/core/popups/popups/DriverInstall.svelte";
import Button from "$components/ui/Button.svelte";
import ProgressBar from "$components/ui/ProgressBar.svelte";
import { type PopupState, popups } from "$state/popup.svelte";
import { usbRequest } from "$state/upload.svelte";
import {
	Prompt,
	SUPPORTED_VENDOR_IDS,
	installed,
	port,
	robot,
} from "$state/workspace.svelte";
import JSZip from "jszip";
import { getContext, onMount } from "svelte";
import type { Writable } from "svelte/store";
import { downloadDrivers } from "../../../../drivers";

interface Props {
	source?: string;
	program?: Record<string, string>;
}
const popupState = getContext<Writable<PopupState>>("state");
const { source, program }: Props = $props();
let progress = $state(0);
let currentState = $state("CONNECTING");
let error = $state<string | null>(null);
let done = $state(false);
let failed = $state(false);

class UploadError extends Error {
	constructor(
		public name: string,
		public description: string,
	) {
		super();
	}
}

async function compile() {
	currentState = "COMPILATION_STARTED";
	const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/compile/cpp`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			source_code: source,
			board: $robot.fqbn,
			libraries: [
				...$robot.libraries,
				...$installed.map(([name, version]) => `${name}@${version}`),
			],
		}),
	});
	if (!res.ok) {
		const { detail } = await res.json();
		throw new UploadError("COMPILATION_FAILED", detail);
	}

	return await res.json();
}

async function upload(res: Record<string, string>) {
	try {
		currentState = "WAITING_FOR_PORT";
		await port.ready;
		progress += 100 / 4;

		currentState = "UPDATE_STARTED";
		await port.reserve();
		await $robot.programmer.upload($port, res);
	} catch (e) {
		console.log(e);
		throw new UploadError("UPDATE_FAILED", e);
	} finally {
		port.release();
	}
}

onMount(async () => {
	try {
		try {
			if (!$port) await port.connect(Prompt.MAYBE);
			progress += 100 / 4;
		} catch {
			throw new UploadError("NO_DEVICE_SELECTED", "");
		}

		const res = program || (await compile());
		progress += 100 / 4;

		await upload(res);

		progress = 100;
		currentState = "UPDATE_COMPLETE";
		done = true;
	} catch (e) {
		done = true;
		failed = true;
		currentState = e?.name || "UPDATE_FAILED";
		error = e.description;
	}
});

function close() {
	popups.close($popupState.id);
}

async function connectUSB() {
	const [device] = await navigator.usb.getDevices();
	if (device) return usbRequest.respond(device);

	usbRequest.respond(
		await navigator.usb.requestDevice({
			filters: SUPPORTED_VENDOR_IDS.map((vendor) => ({
				vendorId: vendor,
			})),
		}),
	);
}
</script>

<div class="content" class:error={!!failed}>
    {#if $usbRequest}
        <h2 class="state">{$_("RECONNECT")}</h2>
        <div class="info">{$_("RECONNECT_INFO")}</div>
        <Button name={"Reconnect"} mode={"primary"} onclick={connectUSB} />
    {:else}
        <h2 class="state">{$_(currentState)}</h2>

        {#if error}
            <code class="error-result">{error}</code>
        {/if}
        {#if done}
            <Button
				name={$_("LEAVE_UPLOADING")}
                mode={"primary"}
                onclick={close}
            />
        {:else}
            <ProgressBar {progress} />
        {/if}
		{#if failed}
			<Button
				name={$_("DOWNLOAD_DRIVERS")}
				mode={"accent"}
				onclick={downloadDrivers}
			/>
		{/if}
    {/if}
</div>

<style>
    h2 {
        margin: 0;
    }

    .content {
        display: flex;
        flex-direction: column;
        padding: 20px;
        gap: 20px;
        justify-content: center;
        align-items: center;
        min-width: 400px;
        max-width: 80vw;
        min-height: 200px;
        max-height: 80vh;
    }

    .state {
        font-weight: bold;
    }

    .error h2 {
        color: red;
    }
    .error-result {
        background: var(--secondary);
        border-radius: 5px;
        padding: 10px;
        color: red;
    }
</style>
