<script lang="ts">
import Button from "$components/ui/Button.svelte";
import type { Robot } from "$domain/robots";
import SerialState, { Prompt } from "$state/serial.svelte";
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import { _ } from "svelte-i18n";

interface Props {
	robots: Robot[][];
	onselect: (robot: Robot) => void;
	compact?: boolean;
	selected?: Robot;
	secondary?: boolean;
}

const {
	robots,
	onselect,
	compact = false,
	selected,
	secondary,
}: Props = $props();
</script>

<div class="container" class:secondary class:compact>
	<div class="selector">
		{#if secondary}
			<Button onclick={() => SerialState.connect(Prompt.ALWAYS)} mode="tint" icon={faUsb} name={SerialState.port ? SerialState.board?.name || $_("UNKNOWN_BOARD") : $_("NOT_CONNECTED")} bold={!!SerialState.port} large />
		{/if}
		{#each robots as row}
			<div class="row">
				{#each row as robot}
					<button
						class="robot"
						class:selected={robot.id === selected?.id || ("board" in robot && SerialState.board?.id === robot.board)}
						onclick={() => onselect(robot)}
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
</div>

<style>
	.container {
		width: 50vw;
		height: 100%;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.selector {
		display: flex;
		flex-direction: column;
		gap: 3vh;
	}

	.secondary {
		background: var(--background);
	}

	.compact {
		width: unset;
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

	.robot:hover .icon, .selected .icon {
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
