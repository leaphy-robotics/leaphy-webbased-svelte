<script lang="ts">
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import Button from "$components/ui/Button.svelte";
import type { PopupState } from "$state/popup.svelte";

const popupState = getContext<PopupState>("state");
function close() {
	popupState.close();
}
function close_dont_show_again() {
	localStorage.setItem("dontShowBrowserNotSupported", "true");
	popupState.close();
}
</script>

<div class="p-2.5 text-red-500 text-center">
	<h2>{$_("BROWSER_NOT_SUPPORTED")}</h2>
</div>

<div class="flex flex-col items-center w-[800px] gap-2.5 text-center px-5">
	<div>{$_("BROWSER_NOT_SUPPORTED_1")}</div>
	<div>{$_("BROWSER_NOT_SUPPORTED_SUGGESTION")}</div>
</div>

<div class="flex justify-center mt-5 p-5 gap-5">
	<Button name={$_("ACKNOWLEDGE_BROWSER_NOT_SUPPORTED")} mode={"primary"} onclick={close} bold={true} />
	<Button name={$_("ACKNOWLEDGE_BROWSER_NOT_SUPPORTED_DONT_SHOW_AGAIN")} mode={"secondary"} onclick={close_dont_show_again} bold={true} />
</div>
