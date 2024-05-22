<script lang="ts">
import type { Robot } from "$domain/robots";
import Tile from "./Tile.svelte";

interface Props {
	robots: Robot[][];
	secondary: boolean;
}

const { robots, secondary }: Props = $props();
</script>

<div class="selector" class:secondary>
	{#each robots as row}
		<div class="row">
			{#each row as robot (robot.id)}
				<Tile type={robot} />
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
</style>
