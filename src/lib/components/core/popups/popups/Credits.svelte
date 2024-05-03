<script lang="ts">
import { _ } from "svelte-i18n";

import contribute from "$assets/contribute-foundation.png";
import leaphyLogo from "$assets/leaphy-logo-color.svg";
import Button from "$components/ui/Button.svelte";
import { type PopupState, popups } from "$state/popup.svelte";
import { getContext } from "svelte";
import type { Writable } from "svelte/store";

const popupState = getContext<Writable<PopupState>>("state");
function close() {
	localStorage.setItem("credits", "true");
	popups.close($popupState.id);
}
</script>

<div class="content">
    <div class="intro">{$_("CREDITS_INTRODUCTION")}</div>
    <img class="logo" src={leaphyLogo} alt="Leaphy foundation" />
    <img class="logo" src={contribute} alt="Contribute foundation" />
    <Button name={$_("START")} mode={"accent"} bold={true} onclick={close} />
</div>

<style>
    .content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 50px;
        gap: 20px;
        width: 800px;
    }

    .intro {
        margin-bottom: 20px;
    }

    .logo {
        width: 180px;
    }
</style>
