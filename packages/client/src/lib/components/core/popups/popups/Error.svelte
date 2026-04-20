<script lang="ts">
import Feedback from "$components/core/popups/popups/Feedback.svelte";
import Button from "$components/ui/Button.svelte";
import PopupsState, { type PopupState } from "$state/popup.svelte";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { getContext } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";

interface Props {
	title: string;
	message: string;
}

const { title, message }: Props = $props();

const popupState = getContext<PopupState>("state");
function ok() {
	popupState.close();
}

function feedback() {
	popupState.close();
	PopupsState.open({
		component: Feedback,
		data: {},
		allowInteraction: false,
	});
}
</script>

<div class="p-5 flex flex-col min-w-[400px] text-center gap-4">
	<h2 class="m-0 text-[salmon] flex items-center justify-center gap-2">
		<Fa icon={faExclamationTriangle} />
		{$_(title)}
	</h2>
	<div>{$_(message)}</div>
	<div class="flex justify-center gap-2.5 mt-2">
		<Button name={$_("SEND_FEEDBACK")} mode="secondary" onclick={feedback} />
		<Button name={$_("OK")} mode={"primary"} onclick={ok}/>
	</div>
</div>
