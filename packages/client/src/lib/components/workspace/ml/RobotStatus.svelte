<script lang="ts">
import { _ } from "svelte-i18n";
import MLState from "$state/ml.svelte";
import WorkspaceState from "$state/workspace.svelte";
import Lidar from "./sensors/Lidar.svelte";
</script>

<div class="flex flex-col items-center bg-bg rounded-l-2xl w-[400px]">
	<div class="flex flex-col items-center">
		<div class="text-2xl font-bold">{WorkspaceState.robot.name}</div>
		<img class="h-24" src={WorkspaceState.robot.icon} alt="robot icon" />
	</div>

	<div class="flex flex-col gap-0.5 bg-secondary rounded-2xl overflow-hidden w-full">
		{#each MLState.snapshot as sensor}
			{@const name = sensor.type.renderName(sensor.settings)}
			<div class="flex justify-between items-center border-b-2 border-black/15 px-5 py-2.5 first:pt-4 last:pb-4 last:border-b-0 {sensor.type.type === 'lidar' ? 'flex-col items-start gap-2.5' : ''}">
				<div>{$_(name.translation, { values: name.values })}</div>
				{#if sensor.type.type === "lidar"}
					<Lidar values={sensor.values} />
				{:else}
					<div>{(sensor.values[0] || 0).toFixed(2)}</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
