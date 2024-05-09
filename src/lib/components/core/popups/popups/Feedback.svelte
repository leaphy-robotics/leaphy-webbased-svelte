<script lang="ts">
import Button from "$components/ui/Button.svelte";
import TextArea from "$components/ui/TextArea.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import { type PopupState, popups } from "$state/popup.svelte";
import * as Sentry from "@sentry/browser";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import type { Writable } from "svelte/store";

let comments = "";
let senderName = "";
let senderEmail = "";
const popupState = getContext<Writable<PopupState>>("state");

function cancel() {
	popups.close($popupState.id, false);
}

function save() {
	const eventId = Sentry.captureMessage("User Feedback");
	const userFeedback = {
		event_id: eventId,
		name: senderName,
		email: senderEmail,
		comments: comments,
	};
	Sentry.captureUserFeedback(userFeedback);

	popups.close($popupState.id, comments);
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
			bind:value={senderEmail}
			mode="secondary"
			rounded={true}>
		</TextInput>
	</div>

	<div class="input">
		<TextInput
			placeholder={$_("EMAIL")}
			bind:value={senderName}
			mode="secondary"
			rounded={true}>
		</TextInput>
	</div>

    <TextArea
        bind:value={comments}
        mode={"secondary"}
        rounded={false}
        focus={true}
		rows={10}
    />
    <div class="actions">
        <Button onclick={cancel} mode={"secondary"} name={$_("CANCEL")} />
        <Button onclick={save} mode={"primary"} name={$_("SEND")} />
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
