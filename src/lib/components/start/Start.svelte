<script lang="ts">
import Warning from "$components/core/popups/popups/Warning.svelte";
import RobotSelector from "$components/start/RobotSelector.svelte";
import { type Robot, robotListing } from "$domain/robots";
import AppState, { Screen } from "$state/app.svelte";
import BlocklyState from "$state/blockly.svelte";
import PopupState from "$state/popup.svelte";
import WorkspaceState, { Mode } from "$state/workspace.svelte";
import SerialState, { Prompt } from "$state/serial.svelte"
import { _ } from "svelte-i18n";
import { flip } from "svelte/animate";
import { cubicOut } from "svelte/easing";
import { fly } from "svelte/transition";

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
		WorkspaceState.robot = SerialState.board || type.robot;
		WorkspaceState.Mode = type.mode || Mode.BLOCKS;
		WorkspaceState.code = (BlocklyState.willRestore && localStorage.getItem(`${type.id}_content`)) || type.defaultProgram
	} else {
		WorkspaceState.robot = type;
		WorkspaceState.Mode = Mode.BLOCKS;
		BlocklyState.restore = JSON.parse(localStorage.getItem(`${type.id}_content`));

		if (SerialState.board && type.board !== SerialState.board.id) {
			PopupState
				.open({
					component: Warning,
					data: {
						title: "INVALID_ROBOT_TITLE",
						message: $_("INVALID_ROBOT", {
							values: { robot: WorkspaceState.robot.name, board: SerialState.board.name },
						}),
						showCancel: true,
					},
					allowInteraction: false,
				})
				.then((result) => {
					if (result) return;

					AppState.Screen = Screen.START;
				});
		}
	}

	WorkspaceState.saveState = true;
	AppState.Screen = Screen.WORKSPACE;
}

const animationOptions = {
	easing: cubicOut,
	duration: 300,
};
</script>

<div class="start">
	{#each selectors as robots, i (i)}
		<div
			in:fly={{ x: "100%", ...animationOptions }}
			animate:flip={animationOptions}
		>
			<RobotSelector {onselect} {robots} {selected} secondary={i > 0} />
		</div>
	{/each}
</div>

<style>
    .start {
        display: flex;
        justify-content: center;
        overflow-x: hidden;
        height: var(--full-height);
    }
</style>
