<script lang="ts">
import Warning from "$components/core/popups/popups/Warning.svelte";
import RobotSelector from "$components/start/RobotSelector.svelte";
import { type Robot, robotListing } from "$domain/robots";
import AppState, { Screen } from "$state/app.svelte";
import BlocklyState from "$state/blockly.svelte";
import PopupState from "$state/popup.svelte";
import {
	Mode,
	Prompt,
	code,
	mode,
	port,
	robot,
	saveState,
} from "$state/workspace.svelte";
import { _ } from "svelte-i18n";
import { flip } from "svelte/animate";
import { cubicOut } from "svelte/easing";
import { fly } from "svelte/transition";

const { board } = port;

async function connect() {
	try {
		await port.connect(Prompt.NEVER);
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
		robot.set($board || type.robot);
		mode.set(type.mode || Mode.BLOCKS);
		code.set(
			(BlocklyState.willRestore && localStorage.getItem(`${type.id}_content`)) ||
				type.defaultProgram,
		);
	} else {
		robot.set(type);
		mode.set(Mode.BLOCKS);
		BlocklyState.restore = JSON.parse(localStorage.getItem(`${type.id}_content`));

		if ($board && type.board !== $board.id) {
			PopupState
				.open({
					component: Warning,
					data: {
						title: "INVALID_ROBOT_TITLE",
						message: $_("INVALID_ROBOT", {
							values: { robot: $robot.name, board: $board.name },
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

	saveState.set(true);
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
