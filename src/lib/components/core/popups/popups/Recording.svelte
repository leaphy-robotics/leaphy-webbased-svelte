<script lang="ts">
	import Button from "$components/ui/Button.svelte";
	import TextInput from "$components/ui/TextInput.svelte";
	import { type PopupState, popups } from "$state/popup.svelte";
	import { getContext } from "svelte";
	import { _ } from "svelte-i18n";
	import type { Writable } from "svelte/store";
	import Fa from "svelte-fa";
	import {faCircle} from "@fortawesome/free-solid-svg-icons";

	const popupState = getContext<Writable<PopupState>>("state");
	let name = $state(localStorage.getItem('name') || '')

	async function done() {
		localStorage.setItem('name', name)
		popups.close($popupState.id, name);
	}

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		done();
	}
</script>

<form class="content" {onsubmit}>
	<h2>
		<span class="icon">
			<Fa icon={faCircle} />
		</span>
		{$_("RECORDING")}
	</h2>

	<p class="description">{$_("RECORDING_DESCRIPTION")}</p>

	<div class="input">
		<TextInput
			placeholder={$_("NAME")}
			bind:value={name}
			mode="secondary"
			required
			focus
			rounded={true}>
		</TextInput>
	</div>

	<div class="actions">
		<Button type="submit" mode={"primary"} name={$_("CONTINUE")}/>
	</div>
</form>

<style>
	.input {
		padding-bottom: 10px;
	}

	.content {
		padding: 20px;
		display: flex;
		flex-direction: column;
		min-width: 400px;
		text-align: center;
	}

	.actions {
		display: flex;
		justify-content: center;
		margin-top: 20px;
	}

	.icon {
		color: red;
	}

	.description {
		white-space: pre-line;
	}
</style>
