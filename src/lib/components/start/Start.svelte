<script lang="ts">
import RobotSelector from "$components/start/RobotSelector.svelte";
import {type Robot, type RobotListing, robotListing, robots as allRobots} from "$domain/robots";
import {Screen, screen} from "$state/app.svelte";
import { flip } from "svelte/animate";
import { cubicOut } from "svelte/easing";
import { fly } from "svelte/transition";
import {code, Mode, mode, robot, saveState} from "$state/workspace.svelte";
import {restore} from "$state/blockly.svelte";

let selected = $state<RobotListing>()
const selectors = $derived(
	selected ? [robotListing, selected.variants] : [robotListing],
);
const animationOptions = {
	easing: cubicOut,
	duration: 300,
};

function onselect(type: Robot) {
	window._paq.push(["trackEvent", "SelectRobot", type.name]);

	if ("variants" in type) return selected = type;
	if ("mode" in type) {
		code.set(localStorage.getItem(`session_${type.id}`) || type.defaultProgram);
		robot.set(allRobots[type.defaultRobot]);
		mode.set(type.mode);
		screen.set(Screen.WORKSPACE);
		saveState.set(true);
		return;
	}

	if (localStorage.getItem(`session_blocks_${type.id}`)) {
		restore.set(JSON.parse(localStorage.getItem(`session_blocks_${type.id}`)));
	}
	robot.set(type);
	mode.set(Mode.BLOCKS);
	screen.set(Screen.WORKSPACE);
}
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
