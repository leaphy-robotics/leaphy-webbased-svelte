<script lang="ts">
import RobotSelector from "$components/start/RobotSelector.svelte";
import { type Robot, robotListing, robots } from "$domain/robots";
import { projectDB } from "$domain/storage";
import AppState, { Screen } from "$state/app.svelte";
import BlocklyState from "$state/blockly.svelte";
import SerialState from "$state/serial.svelte";
import WorkspaceState, { getModeID, Mode } from "$state/workspace.svelte";

let selectors = $state<Robot[][][]>([robotListing]);
let selected = $state<Robot>();

async function onselect(type: Robot) {
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
</script>

<div class="flex justify-center overflow-x-hidden" style:height="var(--full-height)">
	{#each selectors as robots, i (i)}
		<div>
			<RobotSelector {onselect} {robots} {selected} />
		</div>
	{/each}
</div>
