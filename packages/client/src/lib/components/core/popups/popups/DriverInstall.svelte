<script lang="ts">
import install_drivers from "$assets/install_drivers.mp4";
import Button from "$components/ui/Button.svelte";
import type { PopupState } from "$state/popup.svelte";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";

const popupState = getContext<PopupState>("state");
function close() {
	popupState.close();
}
</script>

<div class="flex flex-col items-center w-[800px] p-5 gap-5 text-center">
	<h1 class="m-0">{$_("DRIVER_INSTALL_TITLE")}</h1>
	<p class="m-0">{$_("DRIVER_INSTALL_TEXT")}</p>
	<!-- svelte-ignore a11y-media-has-caption -->
	<video src={install_drivers} controls={true} width={600} class="rounded-xl"></video>
	<Button name={$_("CLOSE")} mode={"accent"} onclick={close} bold={true} />
</div>
