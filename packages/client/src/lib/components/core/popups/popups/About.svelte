<script lang="ts">
import contribute from "$assets/contribute-foundation.png";
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
	<img class="w-[180px]" src={contribute} alt="Contribute" />
	<div>
		{$_("INFO_INTRO")}
		<a href="https://github.com/leaphy-robotics" target="_blank">{$_("INFO_GITHUB")}</a>
	</div>
	<div>{$_("INFO_OPEN_SOURCE")}</div>
	<div>{$_("INFO_THANKS")}</div>
	<div>{$_("INFO_TEAM")}</div>
	<Button name={$_("CLOSE")} mode={"accent"} onclick={close} bold={true} />
</div>
