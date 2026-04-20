<script lang="ts">
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import Button from "$components/ui/Button.svelte";
import type { PopupState } from "$state/popup.svelte";

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

<div class="p-5 flex flex-col min-w-[400px] text-center gap-4">
	<h2 class="m-0">{$_(title)}</h2>
	<div>{$_(message)}</div>
	<div class="flex justify-between mt-2">
		{#if showCancel}
			<Button name={$_("CANCEL")} mode={"secondary"} onclick={cancel}/>
		{/if}
		<div class="flex-1"></div>
		<Button name={$_("OK")} mode={"primary"} onclick={ok}/>
	</div>
</div>
