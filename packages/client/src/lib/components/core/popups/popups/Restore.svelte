<script lang="ts">
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { getContext, onMount } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Button from "$components/ui/Button.svelte";
import ListSelect from "$components/ui/ListSelect.svelte";
import RobotRestore from "$components/ui/RobotRestore.svelte";
import { robots } from "$domain/robots";
import { projectDB, type SavedContent, type SavedFile } from "$domain/storage";
import AppState, { Screen } from "$state/app.svelte";
import BlocklyState from "$state/blockly.svelte";
import PopupState, {
	type PopupState as PopupStateType,
} from "$state/popup.svelte";
import RobotRestoreState from "$state/robotRestore.svelte";
import SerialState, { Prompt } from "$state/serial.svelte";
import { track } from "$state/utils";
import WorkspaceState, { Mode } from "$state/workspace.svelte";

interface Props {
	saves: ((SavedContent | SavedFile) & { type: string; saveID: number })[];
}
let { saves = $bindable() }: Props = $props();

const popupState = getContext<PopupStateType>("state");
let value = $state<SavedContent | SavedFile | "robot">("robot");

const saveOptions = $derived(
	saves.map((save) => {
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
	if (value === "robot") {
		const program = await RobotRestoreState.getProgram(Prompt.MAYBE);
		if (!program) {
			return PopupState.open({
				component: ErrorPopup,
				data: {
					title: "NO_PROGRAM",
					message: "NO_PROGRAM_MESSAGE",
				},
				allowInteraction: false,
			});
		}

		WorkspaceState.robot = program.robot;
		WorkspaceState.Mode = Mode.BLOCKS;
		BlocklyState.restore = program.program;
		WorkspaceState.saveState = true;

		AppState.Screen = Screen.WORKSPACE;
		popupState.close();

		return;
	}

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
}

async function updatePopup() {
	const program = RobotRestoreState.program;
	if (program === null) return;
	if (await program) return;
	if (saves.length === 0) popupState.close();

	value = saves[0];
}

$effect(() => {
	track(saves);
	track(RobotRestoreState.program);

	updatePopup().then();
});
</script>

<div class="p-5 flex flex-col gap-5 min-w-[500px] text-center">
	<div class="flex flex-col gap-2.5">
		<h1 class="m-0">{$_("CONTINUE_WORKING")}</h1>
		<span class="flex justify-center gap-1.5">{$_("CONTINUE_WORKING_DESC")}</span>
	</div>

	<RobotRestore selected={value === 'robot'} onselect={() => value = 'robot'} />

	<div class="flex flex-col gap-1.5">
		<ListSelect options={saveOptions} bind:value>
			{#snippet render(name, save)}
				{@const robot = robots[save.robot]}
				<div class="flex justify-between w-full items-center text-left py-2">
					<div class="flex gap-2.5 items-center">
						<img src={robot.icon} alt={robot.name} class="h-10 w-10 object-contain">
						<div class="flex flex-col gap-1.5">
							<div class="text-normal">{name}</div>
							<div class="text-sm text-on-secondary-muted">{'content' in save ? $_("TEMP_SAVE") : $_("LOCAL_SAVE")}</div>
						</div>
					</div>
					<div onclick={(e) => deleteSave(e, save)} class="text-2xl text-[salmon] p-1.5 cursor-pointer">
						<Fa icon={faXmark} />
					</div>
				</div>
			{/snippet}
		</ListSelect>
	</div>

	<div class="flex justify-center gap-2.5">
		<Button onclick={cancel} mode="secondary" large center name={$_("CANCEL")} />
		<Button onclick={open} disabled={!value} large center mode="primary" name={$_("CONTINUE_WORKING")} />
	</div>
</div>
