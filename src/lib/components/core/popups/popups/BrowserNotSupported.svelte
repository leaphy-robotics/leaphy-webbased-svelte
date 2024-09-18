<script lang="ts">
import Button from "$components/ui/Button.svelte";
import { type PopupState, popups } from "$state/popup.svelte";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import type { Writable } from "svelte/store";

const popupState = getContext<Writable<PopupState>>("state");
function close() {
	popups.close($popupState.id);
}
function close_dont_show_again() {
	localStorage.setItem("dontShowBrowserNotSupported", "true");
	popups.close($popupState.id);
}
</script>

<div class="error">
	<h2 class="text">{$_("BROWSER_NOT_SUPPORTED")}</h2>
</div>

<div class="content">
	<div class="text">{$_("BROWSER_NOT_SUPPORTED_1")}</div>
	<div class="text">{$_("BROWSER_NOT_SUPPORTED_SUGGESTION")}</div>
</div>

<div class="actions">
	<Button name={$_("ACKNOWLEDGE_BROWSER_NOT_SUPPORTED")} mode={"primary"} onclick={close} bold={true} />
	<Button name={$_("ACKNOWLEDGE_BROWSER_NOT_SUPPORTED_DONT_SHOW_AGAIN")} mode={"secondary"} onclick={close_dont_show_again} bold={true} />
</div>

<style>
	.error {
		border-radius: 5px;
		padding: 10px;
		color: red;
		text-align: center;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 800px;
		gap: 10px;
		text-align: center;
	}

	.actions {
		display: flex;
		justify-content: center;
		margin-top: 20px;
		padding: 20px;
		gap: 20px;
	}
</style>
