<script lang="ts">
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import contribute from "$assets/contribute-foundation.png";
import leaphyLogo from "$assets/leaphy-logo-color.svg";
import Button from "$components/ui/Button.svelte";
import type { PopupState } from "$state/popup.svelte";

const popupState = getContext<PopupState>("state");
function close() {
	localStorage.setItem("credits", "true");
	popupState.close();
}
</script>

<div class="flex flex-col justify-center items-center p-12 gap-5 w-[800px]">
	<div class="mb-5">{$_("CREDITS_INTRODUCTION")}</div>
	<img class="w-[180px]" src={leaphyLogo} alt="Leaphy foundation" />
	<img class="w-[180px]" src={contribute} alt="Contribute foundation" />
	<Button name={$_("START")} mode={"accent"} bold={true} onclick={close} />
</div>
