<script lang="ts">
import Button from "$components/ui/Button.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import { type PopupState, popups } from "$state/popup.svelte";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import type { Writable } from "svelte/store";

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
const popupState = getContext<Writable<PopupState>>("state");

function cancel() {
	popups.close($popupState.id, false);
}

function save() {
	if (requireValue && !value) return;
	popups.close($popupState.id, value);
}

function onsubmit(event: SubmitEvent) {
	event.preventDefault();
	save();
}
</script>

<form class="content" {onsubmit}>
	<h2>{$_(name)}</h2>
	<TextInput
		bind:value
		placeholder={$_(placeholder)}
		mode={"secondary"}
		rounded={true}
		focus={true}
		required={requireValue}
	/>
	<div class="actions">
		<Button onclick={cancel} mode={"secondary"} name={$_("CANCEL")}/>
		<Button onclick={save} mode={"primary"} name={$_(confirm)}/>
	</div>
</form>

<style>
	.content {
		padding: 20px;
		display: flex;
		flex-direction: column;
		min-width: 400px;
		text-align: center;
	}

	.actions {
		display: flex;
		justify-content: space-between;
		margin-top: 20px;
	}
</style>
