<script lang="ts">
import Feedback from "$components/core/popups/popups/Feedback.svelte";
import Button from "$components/ui/Button.svelte";
import { type PopupState, popups } from "$state/popup.svelte";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { getContext } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import type { Writable } from "svelte/store";

interface Props {
	title: string;
	message: string;
}

const { title, message }: Props = $props();

const popupState = getContext<Writable<PopupState>>("state");
function ok() {
	popups.close($popupState.id);
}

function feedback() {
	popups.close($popupState.id);
	popups.open({
		component: Feedback,
		data: {},
		allowInteraction: false,
	});
}
</script>

<div class="content">
	<h2 class="title">
		<Fa icon="{faExclamationTriangle}" />
		{$_(title)}
	</h2>
	<div class="text">{$_(message)}</div>
	<div class="actions">
		<Button name={$_("SEND_FEEDBACK")} mode="secondary" onclick={feedback} />
		<Button name={$_("OK")} mode={"primary"} onclick={ok}/>
	</div>
</div>

<style>
	.content {
		padding: 20px;
		display: flex;
		flex-direction: column;
		min-width: 400px;
		text-align: center;
	}

	.title {
		color: salmon;
	}

	.actions {
		display: flex;
		justify-content: center;
		margin-top: 20px;
		gap: 10px;
	}
</style>
