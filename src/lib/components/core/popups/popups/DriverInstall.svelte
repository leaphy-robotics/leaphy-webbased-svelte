<script lang="ts">
import install_drivers from "$assets/install_drivers.mp4";
import Button from "$components/ui/Button.svelte";
import { type PopupState, popups } from "$state/popup.svelte";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import type { Writable } from "svelte/store";

const popupState = getContext<Writable<PopupState>>("state");
function close() {
	popups.close($popupState.id);
}
</script>

<div class="content">
	<h1>{$_("DRIVER_INSTALL_TITLE")}</h1>
	<p>{$_("DRIVER_INSTALL_TEXT")}</p>

	<!-- svelte-ignore a11y-media-has-caption -->
	<video src={install_drivers} controls={true} width={600}></video>

    <Button name={$_("CLOSE")} mode={"accent"} onclick={close} bold={true} />
</div>

<style>
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 800px;
        padding: 20px;
        gap: 20px;
        text-align: center;
    }
</style>
