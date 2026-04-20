<script lang="ts">
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import Button from "$components/ui/Button.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import type { PopupState } from "$state/popup.svelte";

interface Props {
	name: string;
	placeholder: string;
	confirm: string;
	value?: string;
	requireValue?: boolean;
}

let {
	name,
	placeholder,
	confirm,
	value = $bindable(""),
	requireValue = false,
}: Props = $props();
const popupState = getContext<PopupState>("state");

function cancel() {
	popupState.close(false);
}

function save() {
	popupState.close(value);
}

function onsubmit(event: SubmitEvent) {
	event.preventDefault();
	save();
}
</script>

<form class="p-5 flex flex-col min-w-[400px] text-center gap-4" {onsubmit}>
	<h2 class="m-0">{$_(name)}</h2>
	<TextInput bind:value placeholder={$_(placeholder)} mode={"secondary"} rounded={true} focus={true} required={requireValue} />
	<div class="flex justify-between mt-2">
		<Button onclick={cancel} mode={"secondary"} name={$_("CANCEL")}/>
		<Button type="submit" mode={"primary"} name={$_(confirm)}/>
	</div>
</form>
