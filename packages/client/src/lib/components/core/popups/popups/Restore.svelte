<script lang="ts">
	import Button from "$components/ui/Button.svelte";
	import ListSelect from "$components/ui/ListSelect.svelte";
	import type { PopupState } from "$state/popup.svelte";
	import RecordingState from "$state/recordings.svelte";
	import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
	import { getContext } from "svelte";
	import Fa from "svelte-fa";
	import { _ } from "svelte-i18n";
	import { Circle, DoubleBounce, RingLoader } from "svelte-loading-spinners";
	import type {SavedContent, SavedFile} from "$domain/storage";
	import {robots} from "$domain/robots";
	import WorkspaceState, {Mode} from '$state/workspace.svelte'
	import BlocklyState from "$state/blockly.svelte";
	import AppState, {Screen} from "$state/app.svelte";

	interface Props {
		saves: (SavedContent | SavedFile)[]
	}
	const { saves }: Props = $props();

	const popupState = getContext<PopupState>("state");
	let value = $state<SavedContent | SavedFile>(saves[0]);

	const saveOptions = $derived(saves.map(save => {
		const robot = robots[save.robot]

		let name = robot.name
		if (save.mode === 'ADVANCED') {
			name = `C++ - ${robot.name}`;
		} else if (save.mode === 'PYTHON') {
			name = `MicroPython - ${robot.name}`;
		}

		if ('fileHandle' in save) {
			name = `${save.fileHandle.name} (${name})`
		}

		return [name, save]
	}) as [string, SavedContent][])

	function cancel() {
		popupState.close()
	}

	async function open() {
		if (!value) return

		WorkspaceState.robot = robots[value.robot]
		WorkspaceState.Mode = Mode[value.mode]

		if ('content' in value) {
			if (value.mode === 'BLOCKS') {
				BlocklyState.restore = JSON.parse(value.content)
			} else {
				WorkspaceState.code = value.content
			}
		} else {
			await value.fileHandle.requestPermission()
			await WorkspaceState.openFileHandle(value.fileHandle)
		}

		WorkspaceState.saveState = true;

		AppState.Screen = Screen.WORKSPACE;
		popupState.close()
	}
</script>

<div class="content">
	<div class="header">
		<h1>{$_("CONTINUE_WORKING")}</h1>
		<span>{$_("CONTINUE_WORKING_DESC")}</span>
	</div>

	<div class="test">
		<ListSelect options={saveOptions} bind:value>
			{#snippet render(name, save)}
				{@const robot = robots[save.robot]}
				<div class="save">
					<img src={robot.icon} alt={robot.name} class="icon">
					<div class="detail">
						<div class="name">{name}</div>
						<div class="type">{'content' in save ? $_("TEMP_SAVE") : $_("LOCAL_SAVE")}</div>
					</div>
				</div>
			{/snippet}
		</ListSelect>
	</div>

	<div class="buttons">
		<Button onclick={cancel} mode="secondary" large center name={$_("CANCEL")} />
		<Button onclick={open} disabled={!value} large center mode="primary" name={$_("CONTINUE_WORKING")} />
	</div>
</div>

<style>
	.content {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		min-width: 500px;
		text-align: center;
	}

	h1 {
		margin: 0;
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.test {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	span {
		display: flex;
		justify-content: center;
		gap: 5px;
	}

	.save {
		display: flex;
		gap: 10px;
		align-items: center;
		text-align: left;
	}

	.icon {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 40px;
		width: 40px;
		object-fit: contain;
	}

	.detail {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.name {
		font-size: 18px;
	}

	.buttons {
		display: flex;
		justify-content: center;
		gap: 10px;
	}
</style>
