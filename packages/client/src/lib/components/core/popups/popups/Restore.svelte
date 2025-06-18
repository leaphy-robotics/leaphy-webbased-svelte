<script lang="ts">
import Button from "$components/ui/Button.svelte";
import ListSelect from "$components/ui/ListSelect.svelte";
import { robots } from "$domain/robots";
import { type SavedContent, type SavedFile, projectDB } from "$domain/storage";
import AppState, { Screen } from "$state/app.svelte";
import BlocklyState from "$state/blockly.svelte";
import type { PopupState } from "$state/popup.svelte";
import RecordingState from "$state/recordings.svelte";
import WorkspaceState, { Mode } from "$state/workspace.svelte";
import { faCircleCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { getContext } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import { Circle, DoubleBounce, RingLoader } from "svelte-loading-spinners";

interface Props {
	saves: ((SavedContent | SavedFile) & { type: string; saveID: number })[];
}
let { saves = $bindable() }: Props = $props();

const popupState = getContext<PopupState>("state");
let value = $state<SavedContent | SavedFile>(saves[0]);

const saveOptions = $derived(
	saves.map((save) => {
		console.log(`Save-mapping robot ${save.robot}, id ${save.id}`);
		const robot = robots[save.robot];

		let name = robot.name;
		if (save.mode === "ADVANCED") {
			name = `C++ - ${robot.name}`;
		} else if (save.mode === "PYTHON") {
			name = `MicroPython - ${robot.name}`;
		}

		if ("fileHandle" in save) {
			name = `${save.fileHandle.name} (${name})`;
		}

		return [name, save];
	}) as [string, SavedContent | SavedFile][],
);

function cancel() {
	popupState.close();
}

async function open() {
	if (!value) return;

	WorkspaceState.robot = robots[value.robot];
	WorkspaceState.Mode = Mode[value.mode];

	if ("content" in value) {
		if (value.mode === "BLOCKS") {
			BlocklyState.restore = JSON.parse(value.content);
		} else {
			WorkspaceState.code = value.content;
		}
	} else {
		await value.fileHandle.requestPermission();
		await WorkspaceState.openFileHandle(value.fileHandle);
	}

	WorkspaceState.saveState = true;

	AppState.Screen = Screen.WORKSPACE;
	popupState.close();
}

async function deleteSave(
	e: MouseEvent,
	save: (SavedFile | SavedContent) & { type: string; saveID: number },
) {
	e.stopImmediatePropagation();

	saves = saves.filter((e) => e.id !== save.id);
	if ("content" in save) {
		await projectDB.tempSaves.delete(save.saveID);
	} else {
		await projectDB.saves.delete(save.saveID);
	}

	if (saves.length === 0) popupState.close();
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
					<div class="left">
						<img src={robot.icon} alt={robot.name} class="icon">
						<div class="detail">
							<div class="name">{name}</div>
							<div class="type">{'content' in save ? $_("TEMP_SAVE") : $_("LOCAL_SAVE")}</div>
						</div>
					</div>
					<div onclick={(e) => deleteSave(e, save)} class="right">
						<Fa icon={faXmark} />
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
		justify-content: space-between;
		width: 100%;
		align-items: center;
		text-align: left;
	}

	.left {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	.right {
		font-size: 24px;
		color: salmon;
		padding: 5px;
		cursor: pointer;
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
