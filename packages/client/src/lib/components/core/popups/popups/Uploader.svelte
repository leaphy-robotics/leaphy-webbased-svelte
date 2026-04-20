<script lang="ts">
import { _ } from "svelte-i18n";

import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Button from "$components/ui/Button.svelte";
import ProgressBar from "$components/ui/ProgressBar.svelte";
import ExtensionState, { extensions } from "$domain/blockly/extensions.svelte";
import { inFilter } from "$domain/robots";
import AppState from "$state/app.svelte";
import PopupsState, { type PopupState } from "$state/popup.svelte";
import SerialState, {
	Prompt,
	SUPPORTED_VENDOR_IDS,
} from "$state/serial.svelte";
import USBRequestState from "$state/upload.svelte";
import WorkspaceState, { Mode } from "$state/workspace.svelte";
import { Dependencies, arduino } from "@leaphy-robotics/leaphy-blocks";
import { getContext, onMount } from "svelte";
import { downloadDrivers } from "../../../../drivers";

interface Props {
	getCode?: () => Promise<string> | string;
	program?: Record<string, string>;
}
const popupState = getContext<PopupState>("state");
const { getCode, program }: Props = $props();
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

	arduino.boardType = SerialState.board?.id || WorkspaceState.robot.board;
	arduino.robotType = WorkspaceState.robot.id;
	try {
		res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/compile/cpp`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				source_code: await getCode(),
				board: SerialState.board?.fqbn || WorkspaceState.robot.fqbn,
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
		console.error(e);
		throw new UploadError("COMPILATION_FAILED", $_("NO_INTERNET"));
	}

	if (!res.ok) {
		const { detail } = await res.json();
		throw new UploadError("COMPILATION_FAILED", detail);
	}

	return await res.json();
}

async function upload(res: Record<string, string>) {
	currentState = "WAITING_FOR_PORT";
	await SerialState.ready;
	progress += 100 / 4;

	currentState = "UPDATE_STARTED";
	try {
		await SerialState.withPort(async (port) => {
			const programmer =
				SerialState.board?.programmer || WorkspaceState.robot.programmer;
			await programmer.upload(port, res);
		});
	} catch (e) {
		if (e instanceof Error && e.message === "Port already reserved") {
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
		console.log(e);
		throw new UploadError("UPDATE_FAILED", e);
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

		const board = SerialState.board || WorkspaceState.robot;
		const incompatibleExtension = ExtensionState.enabled.find(
			(e) => !inFilter(board, extensions.find((ext) => ext.id === e)?.boards),
		);
		if (incompatibleExtension) {
			popupState.close();
			return PopupsState.open({
				component: ErrorPopup,
				data: {
					title: "INVALID_ROBOT_TITLE",
					message: $_("INVALID_ROBOT", {
						values: {
							board: board.name,
							extension:
								extensions.find((ext) => ext.id === incompatibleExtension)
									?.name || "Unknown",
						},
					}),
					showCancel: true,
				},
				allowInteraction: false,
			});
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

<div class="flex flex-col p-5 gap-5 justify-center items-center min-w-[400px] max-w-[80vw] min-h-[200px] max-h-[80vh]">
	{#if USBRequestState.respond}
		<h2 class="m-0 font-bold">{$_("RECONNECT")}</h2>
		<div>{$_("RECONNECT_INFO")}</div>
		<Button name={"Reconnect"} mode={"primary"} onclick={connectUSB} />
	{:else}
		<h2 class="m-0 font-bold {failed ? 'text-red-500' : ''}">{$_(currentState)}</h2>

		{#if error}
			<code class="bg-secondary rounded-lg px-2.5 py-2.5 overflow-auto text-red-500 w-full">{error}</code>
		{/if}
		{#if done}
			<Button name={$_("LEAVE_UPLOADING")} mode={"primary"} onclick={close} />
		{:else}
			<ProgressBar {progress} />
		{/if}
		{#if failed && navigator.platform.startsWith("Win")}
			<Button name={$_("DOWNLOAD_DRIVERS")} mode={"accent"} onclick={() => {close(); downloadDrivers();}} />
		{/if}
	{/if}
</div>
