<script lang="ts">
import MLState from "$state/ml.svelte";
import WorkspaceState from "$state/workspace.svelte";
import Lidar from "./sensors/Lidar.svelte";
import { _ } from "svelte-i18n";
</script>

<div class="state">
	<div class="header">
		<div class="title">{WorkspaceState.robot.name}</div>
		<img class="icon" src={WorkspaceState.robot.icon} alt="robot icon" />
	</div>

	<div class="list">
		{#each MLState.snapshot as sensor}
			{@const name = sensor.type.renderName(sensor.settings)}
			<div class="item" class:vertical={sensor.type.type === "lidar"}>
				<div class="name">{$_(name.translation, { values: name.values })}</div>
				{#if sensor.type.type === "lidar"}
					<Lidar values={sensor.values} />
				{:else}
					<div class="value">
						{(sensor.values[0] || 0).toFixed(2)}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.state {
		display: flex;
		flex-direction: column;
		align-items: center;

		background: var(--background);
		border-radius: 15px 0 0 15px;
		width: 400px;
	}

	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.title {
		font-size: 1.6em;
		font-weight: bold;
	}

	.icon {
		height: 100px;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: var(--secondary);
		border-radius: 20px;
		overflow: hidden;
		width: 100%;
	}

	.item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 2px solid #00000025;
		padding: 10px 20px;
	}

	.item.vertical {
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
	}

	.item:first-child {
		padding-top: 15px;
	}
	.item:last-child {
		padding-bottom: 15px;
		border-bottom: none;
	}
</style>
