<script lang="ts">
import { _ } from "svelte-i18n";
import contribute from "$assets/contribute-foundation.png";
import Button from "$components/ui/Button.svelte";
import { getContext } from "svelte";
import type { Writable } from "svelte/store";
import { popups, type PopupState } from "$state/popup.svelte";

const popupState = getContext<Writable<PopupState>>("state");
function close() {
	popups.close($popupState.id);
}
</script>

<div class="content">
    <img class="logo" src={contribute} alt="Contribute" />
    <div class="text">
        {$_("INFO_INTRO")}
        <a href="https://github.com/leaphy-robotics" target="_blank"
            >{$_("INFO_GITHUB")}</a
        >
    </div>
    <div class="text">{$_("INFO_OPEN_SOURCE")}</div>
    <div class="text">{$_("INFO_THANKS")}</div>
    <div class="text">{$_("INFO_TEAM")}</div>
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

    .logo {
        width: 180px;
    }
</style>
