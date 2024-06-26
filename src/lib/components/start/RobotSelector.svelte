<script lang="ts">
import { type Robot, robots as allRobots } from "$domain/robots";
import { Screen, screen, selected } from "$state/app.svelte";
import { restore } from "$state/blockly.svelte";
import { Mode, code, mode, robot, saveState } from "$state/workspace.svelte";

interface Props {
	robots: Robot[][];
	secondary: boolean;
}

const { robots, secondary }: Props = $props();

function select(type: Robot) {
	window._paq.push(["trackEvent", "SelectRobot", type.name]);

	if ("variants" in type) return selected.set(type);
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

<div class="selector" class:secondary>
	{#each robots as row}
		<div class="row">
			{#each row as robot}
				<button
					class="robot"
					onclick={() => select(robot)}
					class:selected={$selected?.id === robot.id}
				>
                    <span class="icon">
                        <img class="image" src={robot.icon} alt={robot.name}/>
                    </span>
					<span class="name">{robot.name}</span>
				</button>
			{/each}
		</div>
	{/each}
</div>

<style>
	.selector {
		width: 50vw;
		height: 100%;

		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 3vh;
	}

	.secondary {
		background: var(--background);
	}

	.row {
		display: flex;
		justify-content: center;
		gap: 24px;
	}

	.robot {
		width: 12vw;
		max-width: 180px;
		cursor: pointer;

		border: none;
		background: none;

		transition: 0.1s ease;
		color: var(--on-background);
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
