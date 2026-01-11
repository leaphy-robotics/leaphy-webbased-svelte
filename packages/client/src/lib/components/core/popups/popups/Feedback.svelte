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

	await fetch(`${import.meta.env.VITE_API_URL}/feedback`, {
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

<form class="content" {onsubmit}>
	<div class="header">
		<h1>{$_("FEEDBACK")}</h1>
		<span>{$_("FEEDBACK_INTRODUCTION")}</span>
	</div>
	<div class="input">
		<TextInput
			placeholder={$_("NAME")}
			bind:value={senderName}
			mode="secondary"
			focus={true}
			required
			rounded={true}>
		</TextInput>
	</div>

	<div class="input">
		<TextInput
			placeholder={$_("EMAIL")}
			bind:value={senderEmail}
			mode="secondary"
			type="email"
			required
			rounded={true}>
		</TextInput>
	</div>

	<TextArea
		placeholder={$_("MESSAGE")}
		bind:value={message}
		mode={"secondary"}
		required
		rows={6}
	/>

	<div class="attachments">
		<span class="label">{$_("ATTACHMENTS")}</span>
		<div class="attachments-list">
			<label class="attachment" for="upload-logs">
				<input type="checkbox" id="upload-logs" bind:checked={uploadLogs} />
				<span class="checkbox-custom"></span>
				<span class="attachment-label">{$_("UPLOAD_LOGS")}</span>
			</label>
			<label class="attachment" for="workspace">
				<input type="checkbox" id="workspace" bind:checked={workspace} />
				<span class="checkbox-custom"></span>
				<span class="attachment-label">{$_("WORKSPACE")}</span>
			</label>
		</div>
		<span class="info-text">{$_("FEEDBACK_INFO")}</span>
	</div>

	<div class="buttons">
		<Button large onclick={cancel} mode={"secondary"} name={$_("CANCEL")}/>
		<Button large type="submit" mode={"primary"} name={$_("SEND")}/>
	</div>
</form>

<style>
	.header {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.header span {
		font-size: 0.9em;
		line-height: 1.4;
	}

	.content {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		min-width: 400px;
		text-align: center;
	}

	h1 {
		margin: 0;
		font-size: 1.3em;
	}

	.buttons {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-top: 2px;
	}

	.attachments {
		display: flex;
		flex-direction: column;
		gap: 4px;
		text-align: left;
	}

	.attachments .label {
		font-weight: 600;
		font-size: 0.9em;
		color: var(--on-background);
		margin-bottom: 2px;
	}

	.attachments-list {
		display: flex;
		gap: 5px;
	}

	.attachment {
		display: flex;
		align-items: center;
		flex: 1;
		gap: 8px;
		padding: 8px 10px;
		background: var(--secondary);
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
	}

	.attachment input[type="checkbox"] {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.checkbox-custom {
		position: relative;
		width: 20px;
		height: 20px;
		min-width: 20px;
		border: 2px solid var(--on-secondary-muted);
		border-radius: 6px;
		background: transparent;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.attachment input[type="checkbox"]:checked + .checkbox-custom {
		background: var(--primary);
		border-color: var(--primary);
	}

	.attachment input[type="checkbox"]:checked + .checkbox-custom::after {
		content: "";
		position: absolute;
		width: 5px;
		height: 10px;
		border: solid var(--on-primary);
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
		top: 2px;
	}

	.attachment input[type="checkbox"]:focus-visible + .checkbox-custom {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	.attachment-label {
		font-size: 0.95em;
		color: var(--on-secondary);
		user-select: none;
		flex: 1;
	}

	.info-text {
		font-size: 0.8em;
		color: var(--on-secondary-muted);
		line-height: 1.3;
		margin-top: 2px;
	}
</style>
