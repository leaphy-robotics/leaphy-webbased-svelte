<script lang="ts">
import { _ } from "svelte-i18n";

import RobotSelector from "$components/start/RobotSelector.svelte";
import Button from "$components/ui/Button.svelte";
import ProgressBar from "$components/ui/ProgressBar.svelte";
import { type RobotDevice, robots } from "$domain/robots";
import type { PopupState } from "$state/popup.svelte";
import SerialState, { SUPPORTED_VENDOR_IDS } from "$state/serial.svelte";
import USBRequestState from "$state/upload.svelte";
import WorkspaceState from "$state/workspace.svelte";
import { getContext, onMount } from "svelte";
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
let robotRequest = $state<(robot: RobotDevice) => void>();

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
		await SerialState.reserve();
		await WorkspaceState.robot.programmer.upload(SerialState.port, res);
	} catch (e) {
		console.log(e);
		throw new UploadError("UPDATE_FAILED", e);
	}
	SerialState.release();
}

onMount(async () => {
	try {
		const installed = await io.enterREPLMode();
		progress += 100 / 6;

		currentState = "CHOOSING_ROBOT";
		if (!installed) {
			WorkspaceState.robot = await new Promise<RobotDevice>(
				(resolve) => (robotRequest = resolve),
			);
		}
		robotRequest = undefined;
		progress += 100 / 6;

		currentState = "DOWNLOADING_FIRMWARE";
		let firmware: Record<string, string>;
		if (!installed) firmware = await io.getFirmware(WorkspaceState.robot);
		progress += 100 / 6;

		currentState = "UPLOADING_FIRMWARE";
		if (!installed) await upload(firmware);
		progress += 100 / 6;

		currentState = "CONNECTING";
		if (!installed) await io.enterREPLMode();
		progress += 100 / 6;

		currentState = "INSTALLING_LIBRARIES";
		await io.packageManager.flashLibrary(
			"github:leaphy-robotics/leaphy-micropython/package.json",
		);
		progress += 100 / 6;

		popupState.close();
	} catch (e) {
		done = true;
		currentState = e?.name || "UPDATE_FAILED";
		error = e.description;
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

    <div class="content" class:error={!!error}>
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

				{#if robotRequest}
					<RobotSelector onselect={robotRequest} robots={[[robots.l_nano_rp2040, robots.l_nano_esp32]]} secondary={false} compact />
				{/if}
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
