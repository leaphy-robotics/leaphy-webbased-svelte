<script lang="ts">
import type { Robot, RobotListing } from "$domain/robots";

interface Props {
	robots: Robot[][];
	secondary: boolean;
	onselect: (robot: Robot) => void;
	selected?: RobotListing;
	compact?: boolean;
}

const {
	robots,
	secondary,
	onselect,
	selected,
	compact = false,
}: Props = $props();
</script>

<div class="selector" class:secondary class:compact>
	{#each robots as row}
		<div class="row">
			{#each row as robot}
				<button
					class="robot"
					onclick={() => onselect(robot)}
					class:selected={selected?.id === robot.id}
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

	.selector.compact {
		width: unset;
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
