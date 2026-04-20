<script lang="ts">
import Warning from "$components/core/popups/popups/Warning.svelte";
import Button from "$components/ui/Button.svelte";
import TextArea from "$components/ui/TextArea.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import AppState from "$state/app.svelte";
import BlocklyState from "$state/blockly.svelte";
import PopupsState, { type PopupState } from "$state/popup.svelte";
import SerialState from "$state/serial.svelte";
import WorkspaceState from "$state/workspace.svelte";
import { Mode } from "$state/workspace.svelte";
import * as Sentry from "@sentry/browser";
import { serialization } from "blockly";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";

let message = $state("");
let senderName = $state("");
let senderEmail = $state("");
let uploadLogs = $state(true);
let workspace = $state(true);

const popupState = getContext<PopupState>("state");

function cancel() {
	popupState.close(false);
}

async function save() {
	const workspaceContent =
		WorkspaceState.Mode === Mode.BLOCKS
			? JSON.stringify(serialization.workspaces.save(BlocklyState.workspace))
			: WorkspaceState.code;

	await fetch(`${import.meta.env.VITE_BACKEND_URL}/feedback`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: senderName,
			email: senderEmail,
			message: message,
			robot: WorkspaceState.robot.id,
			board: SerialState.board?.id,
			libraries: AppState.libraries.installed.map(
				(library) => `${library[0]}@${library[1]}`,
			),
			uploadLogs: uploadLogs ? WorkspaceState.uploadLog.join("\n") : undefined,
			sketch: workspace ? workspaceContent : undefined,
			platform: `${navigator.userAgentData?.platform || $_("UNKNOWN")}, ${navigator.userAgentData?.brands[0].brand || $_("UNKNOWN")} (${navigator.userAgentData?.brands[0].version || $_("UNKNOWN")}), ${"serial" in navigator ? $_("WEB_SERIAL_SUPPORTED") : $_("WEB_SERIAL_NOT_SUPPORTED")}`,
		}),
	});

	await PopupsState.open({
		component: Warning,
		data: {
			title: "FEEDBACK",
			message: "FEEDBACK_SENT",
			showCancel: false,
		},
		allowInteraction: true,
	});

	popupState.close(message);
}

function onsubmit(event: SubmitEvent) {
	event.preventDefault();
	save();
}
</script>

<form class="p-4 flex flex-col gap-3.5 min-w-[400px] text-center" {onsubmit}>
	<div class="flex flex-col gap-1.5 text-left">
		<h1 class="m-0 text-xl">{$_("FEEDBACK")}</h1>
		<span class="text-sm leading-snug">{$_("FEEDBACK_INTRODUCTION")}</span>
	</div>

	<TextInput placeholder={$_("NAME")} bind:value={senderName} mode="secondary" focus={true} required rounded={true} />
	<TextInput placeholder={$_("EMAIL")} bind:value={senderEmail} mode="secondary" type="email" required rounded={true} />
	<TextArea placeholder={$_("MESSAGE")} bind:value={message} mode={"secondary"} required rows={6} />

	<div class="flex flex-col gap-1 text-left">
		<span class="font-semibold text-sm">{$_("ATTACHMENTS")}</span>
		<div class="flex gap-1.5">
			<label class="flex flex-1 items-center gap-2 px-2.5 py-2.5 bg-secondary rounded-xl cursor-pointer transition-all relative">
				<input type="checkbox" class="absolute opacity-0 w-0 h-0" id="upload-logs" bind:checked={uploadLogs} />
				<span class="relative w-5 h-5 min-w-5 border-2 border-on-secondary-muted rounded-md bg-transparent flex items-center justify-center transition-all {uploadLogs ? 'bg-primary border-primary' : ''}">
					{#if uploadLogs}<span class="text-on-primary text-xs font-bold">✓</span>{/if}
				</span>
				<span class="text-sm text-on-secondary select-none flex-1">{$_("UPLOAD_LOGS")}</span>
			</label>
			<label class="flex flex-1 items-center gap-2 px-2.5 py-2.5 bg-secondary rounded-xl cursor-pointer transition-all relative">
				<input type="checkbox" class="absolute opacity-0 w-0 h-0" id="workspace" bind:checked={workspace} />
				<span class="relative w-5 h-5 min-w-5 border-2 border-on-secondary-muted rounded-md bg-transparent flex items-center justify-center transition-all {workspace ? 'bg-primary border-primary' : ''}">
					{#if workspace}<span class="text-on-primary text-xs font-bold">✓</span>{/if}
				</span>
				<span class="text-sm text-on-secondary select-none flex-1">{$_("WORKSPACE")}</span>
			</label>
		</div>
		<span class="text-xs text-on-secondary-muted leading-tight mt-0.5">{$_("FEEDBACK_INFO")}</span>
	</div>

	<div class="flex justify-center gap-2 mt-0.5">
		<Button large onclick={cancel} mode={"secondary"} name={$_("CANCEL")}/>
		<Button large type="submit" mode={"primary"} name={$_("SEND")}/>
	</div>
</form>
