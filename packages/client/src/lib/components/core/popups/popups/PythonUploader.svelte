<script lang="ts">
import { getContext, onMount } from "svelte";
import { _ } from "svelte-i18n";
import RobotSelector from "$components/start/RobotSelector.svelte";
import Button from "$components/ui/Button.svelte";
import ProgressBar from "$components/ui/ProgressBar.svelte";
import { type RobotDevice, robots } from "$domain/robots";
import type { PopupState } from "$state/popup.svelte";
import SerialState, { SUPPORTED_VENDOR_IDS } from "$state/serial.svelte";
import USBRequestState from "$state/upload.svelte";
import WorkspaceState from "$state/workspace.svelte";
import type MicroPythonIO from "../../../../micropython";

interface Props {
	io: MicroPythonIO;
}
const popupState = getContext<PopupState>("state");
const { io }: Props = $props();
let progress = $state(0);
let currentState = $state("CONNECTING");
let error = $state<string | null>(null);
let done = $state(false);

class UploadError extends Error {
	constructor(
		public name: string,
		public description: string,
	) {
		super();
	}
}

async function upload(res: Record<string, string>) {
	try {
		await SerialState.withPort(async (port) => {
			await WorkspaceState.robot.programmer.upload(port, res);
		});
	} catch (e) {
		console.log(e);
		throw new UploadError("UPDATE_FAILED", e);
	}
}

onMount(async () => {
	try {
		const progress_step = 100 / 2;
		const installed = await io.enterREPLMode();
		progress += progress_step;

		if (!installed) {
			throw { name: "NOT_CONNECTED", description: "No REPL initiated." };
		}

		currentState = "INSTALLING_LIBRARIES";
		await io.packageManager.flashLibrary(
			"github:leaphy-robotics/leaphy-micropython/package.json",
		);
		progress += progress_step;

		popupState.close();
	} catch (e) {
		currentState = e?.name || "UPDATE_FAILED";
		error = e.message;
		throw e;
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

<div class="flex flex-col p-5 gap-5 justify-center items-center min-w-[400px] max-w-[80vw] min-h-[200px] max-h-[80vh]">
	{#if USBRequestState.respond}
		<h2 class="m-0 font-bold">{$_("RECONNECT")}</h2>
		<div>{$_("RECONNECT_INFO")}</div>
		<Button name={"Reconnect"} mode={"primary"} onclick={connectUSB} />
	{:else}
		<h2 class="m-0 font-bold {error ? 'text-red-500' : ''}">{$_(currentState)}</h2>

		{#if error}
			<code class="bg-secondary rounded-lg px-2.5 py-2.5 text-red-500 w-full">{error}</code>
		{/if}
		{#if done || error}
			<Button name={$_("LEAVE_UPLOADING")} mode={"primary"} onclick={close} />
		{:else}
			<ProgressBar {progress} />
		{/if}
	{/if}
</div>
