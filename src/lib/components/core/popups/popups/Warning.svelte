<script lang="ts">
import Button from "$components/ui/Button.svelte";
import { type PopupState } from "$state/popup.svelte";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";

interface Props {
	title: string;
	message: string;
	showCancel: boolean;
}

const { title, message, showCancel = true }: Props = $props();

const popupState = getContext<PopupState>("state");

function cancel() {
	popupState.close(false);
}

function ok() {
	popupState.close(true);
}
</script>

<div class="content">
	<h2>{$_(title)}</h2>
	<div class="text">{$_(message)}</div>
	<div class="actions">
		{#if showCancel}
			<Button name={$_("CANCEL")} mode={"secondary"} onclick={cancel}/>
		{/if}
		<div></div>
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

	.actions {
		display: flex;
		justify-content: space-between;
		margin-top: 20px;
	}
</style>
