<script lang="ts">
import { type Robot, robots } from "$domain/robots";
import { Screen, screen, selected } from "$state/app.svelte";
import { restore, willRestore } from "$state/blockly.svelte";
import { Mode, code, mode, robot, saveState } from "$state/workspace.svelte";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";
import { get } from "svelte/store";

interface Props {
	type: Robot;
}
let { type }: Props = $props();

function findSession(type: Robot) {
	if ("mode" in type) {
		return localStorage.getItem(`session_${type.id}`);
	}

	return localStorage.getItem(`session_blocks_${type.id}`);
}

function hasSave() {
	if (!get(willRestore)) return false;
	if ("variants" in type) {
		return !type.variants.flat().every((type) => !findSession(type));
	}

	return !!findSession(type);
}

function select() {
	window._paq.push(["trackEvent", "SelectRobot", type.name]);

	if ("variants" in type) return selected.set(type);
	if ("mode" in type) {
		code.set(findSession(type) || type.defaultProgram);
		robot.set(robots[type.defaultRobot]);
		mode.set(type.mode);
		screen.set(Screen.WORKSPACE);
		saveState.set(true);
		return;
	}

	if (localStorage.getItem(`session_blocks_${type.id}`)) {
		restore.set(JSON.parse(findSession(type)));
	}
	robot.set(type);
	mode.set(Mode.BLOCKS);
	screen.set(Screen.WORKSPACE);
}
</script>

<button
    class="robot"
    onclick={select}
    class:selected={$selected?.id === type.id}
>
    {#if hasSave()}
        <span class="save-wrapper">
            <span class="save">
                <Fa icon={faFloppyDisk} />
            </span>
        </span>
    {/if}
    
    <span class="icon">
        <img class="image" src={type.icon} alt={type.name}/>
    </span>
    <span class="name">{type.name}</span>
</button>

<style>
    .robot {
        position: relative;
		width: 12vw;
		max-width: 180px;
		cursor: pointer;

		border: none;
		background: none;

		transition: 0.1s ease;
		color: var(--on-background);
	}

    .save-wrapper {
        position: absolute;
        top: 0;
        right: 0;
        translate: 0 -10%;
    }

    .save {
        background: var(--primary);
        color: var(--on-primary);
    
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
    }

	.robot.selected,
	.robot:hover {
		scale: 1.03;
	}

	.icon {
		display: flex;
		justify-content: center;
		align-items: center;

		box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
		border: solid 1px var(--background-tint);
		background: var(--robot);
		aspect-ratio: 1/1;
		width: 100%;
		border-radius: 0.375rem;

		transition: 0.1s ease;
		margin-bottom: 1vh;
	}

	.robot.selected .icon,
	.robot:hover .icon {
		border: 3px solid var(--primary) !important;
	}

	.image {
		max-width: 90%;
		max-height: 90%;
	}

	.name {
		font-size: 1rem;
	}
</style>
