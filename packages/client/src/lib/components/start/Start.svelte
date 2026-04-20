<script lang="ts">
import { flip } from "svelte/animate";
import { cubicOut } from "svelte/easing";
import { fly } from "svelte/transition";
import { _ } from "svelte-i18n";
import Warning from "$components/core/popups/popups/Warning.svelte";
import RobotSelector from "$components/start/RobotSelector.svelte";
import { type Robot, robotListing, robots } from "$domain/robots";
import { projectDB } from "$domain/storage";
import AppState, { Screen } from "$state/app.svelte";
import BlocklyState from "$state/blockly.svelte";
import PopupState from "$state/popup.svelte";
import SerialState, { Prompt } from "$state/serial.svelte";
import WorkspaceState, { getModeID, Mode } from "$state/workspace.svelte";

async function connect() {
	try {
		await SerialState.connect(Prompt.NEVER);
	} catch {}
}

let selectors = $state<Robot[][][]>([robotListing]);
let selected = $state<Robot>();

async function onselect(type: Robot) {
	if ("variants" in type) {
		await connect();
		selectors[1] = type.variants;
		selected = type;
		return;
	}

	if ("robot" in type) {
		const tempSave = await projectDB.tempSaves
			.where("mode")
			.equals(getModeID(type.mode || Mode.BLOCKS))
			.first();

		WorkspaceState.robot =
			SerialState.board || robots[tempSave?.robot] || type.robot;
		WorkspaceState.Mode = type.mode || Mode.BLOCKS;
		WorkspaceState.code =
			(BlocklyState.willRestore && tempSave?.content) || type.defaultProgram;
	} else {
		const tempSave = await projectDB.tempSaves
			.where("mode")
			.equals("BLOCKS")
			.and((save) => save.robot === type.id)
			.first();

		WorkspaceState.robot = type;
		WorkspaceState.Mode = Mode.BLOCKS;
		BlocklyState.restore = JSON.parse(tempSave?.content || null);
	}

	WorkspaceState.saveState = true;
	AppState.Screen = Screen.WORKSPACE;
}

const animationOptions = {
	easing: cubicOut,
	duration: 300,
};
</script>

<div class="flex justify-center overflow-x-hidden" style:height="var(--full-height)">
	{#each selectors as robots, i (i)}
		<div
			in:fly={{ x: "100%", ...animationOptions }}
			animate:flip={animationOptions}
		>
			<RobotSelector {onselect} {robots} {selected} secondary={i > 0} />
		</div>
	{/each}
</div>
