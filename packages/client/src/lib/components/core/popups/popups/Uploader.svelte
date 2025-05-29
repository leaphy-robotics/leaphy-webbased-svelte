<script lang="ts">
import { _ } from "svelte-i18n";

import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Button from "$components/ui/Button.svelte";
import ProgressBar from "$components/ui/ProgressBar.svelte";
import AppState from "$state/app.svelte";
import PopupsState, { type PopupState } from "$state/popup.svelte";
import SerialState, {
	Prompt,
	SUPPORTED_VENDOR_IDS,
} from "$state/serial.svelte";
import USBRequestState from "$state/upload.svelte";
import WorkspaceState, { Mode } from "$state/workspace.svelte";
import { Dependencies } from "@leaphy-robotics/leaphy-blocks";
import { getContext, onMount } from "svelte";
import { downloadDrivers } from "../../../../drivers";

interface Props {
	source?: string;
	program?: Record<string, string>;
}
const popupState = getContext<PopupState>("state");
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
	let res: Response;
	try {
		res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/compile/cpp`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				source_code: source,
				board: WorkspaceState.robot.fqbn,
				libraries: [
					...(WorkspaceState.Mode === Mode.ADVANCED
						? [Dependencies.LEAPHY_EXTENSIONS]
						: []),
					...AppState.libraries.installed.map(
						([name, version]) => `${name}@${version}`,
					),
				],
			}),
		});
	} catch (e) {
		throw new UploadError("COMPILATION_FAILED", $_("NO_INTERNET"));
	}

	if (!res.ok) {
		const { detail } = await res.json();
		throw new UploadError("COMPILATION_FAILED", detail);
	}

	return await res.json();
}

async function upload(res: Record<string, string>) {
	try {
		try {
			currentState = "WAITING_FOR_PORT";
			await SerialState.ready;
			progress += 100 / 4;

			currentState = "UPDATE_STARTED";
			await SerialState.reserve();
		} catch (e) {
			console.log(e);
			popupState.close();
			return PopupsState.open({
				component: ErrorPopup,
				data: {
					title: "ROBOT_RESERVED",
					message: "ROBOT_RESERVED_MESSAGE",
				},
				allowInteraction: false,
			});
		}

		await WorkspaceState.robot.programmer.upload(SerialState.port, res);
	} catch (e) {
		console.log(e);
		throw new UploadError("UPDATE_FAILED", e);
	} finally {
		SerialState.release();
	}
}

onMount(async () => {
	try {
		try {
			if (!SerialState.port) await SerialState.connect(Prompt.MAYBE);
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
	popupState.close();
}

async function connectUSB() {
	const [device] = await navigator.usb.getDevices();
	if (device) return USBRequestState.respond(device);

	USBRequestState.respond(
		await navigator.usb.requestDevice({
			filters: SUPPORTED_VENDOR_IDS.map((vendor) => ({
				vendorId: vendor,
			})),
		}),
	);
}
</script>

<div class="content" class:error={!!failed}>
    {#if USBRequestState.respond}
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
				onclick={() => {close(); downloadDrivers();}}
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
