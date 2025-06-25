<script lang="ts">
import Warning from "$components/core/popups/popups/Warning.svelte";
import Button from "$components/ui/Button.svelte";
import TextArea from "$components/ui/TextArea.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import PopupsState, { type PopupState } from "$state/popup.svelte";
import * as Sentry from "@sentry/browser";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";

let message = "";
let senderName = "";
let senderEmail = "";
const popupState = getContext<PopupState>("state");

function cancel() {
	popupState.close(false);
}

async function save() {
	const eventId = Sentry.captureMessage("User Feedback");
	const userFeedback = {
		event_id: eventId,
		name: senderName,
		email: senderEmail,
		message: message,
	};
	Sentry.captureFeedback(userFeedback);

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
	<h2>{$_("FEEDBACK")}</h2>
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
		bind:value={message}
		mode={"secondary"}
		rounded={true}
		required
		rows={10}
	/>
	<div class="actions">
		<Button onclick={cancel} mode={"secondary"} name={$_("CANCEL")}/>
		<Button type="submit" mode={"primary"} name={$_("SEND")}/>
	</div>
</form>

<style>
	.input {
		padding-bottom: 10px;
	}

	.content {
		padding: 20px;
		display: flex;
		flex-direction: column;
		min-width: 400px;
		text-align: center;
	}

	.actions {
		display: flex;
		justify-content: space-between;
		margin-top: 20px;
	}
</style>
