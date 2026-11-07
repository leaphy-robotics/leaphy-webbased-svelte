<script lang="ts">
import { _ } from "svelte-i18n";
import MLState from "$state/ml.svelte";
import WorkspaceState from "$state/workspace.svelte";
import Lidar from "./sensors/Lidar.svelte";
</script>

<section class="flex flex-col gap-2.5 rounded-2xl bg-bg p-4 text-left">
	<div class="flex items-center gap-3">
		<img class="h-9" src={WorkspaceState.robot.icon} alt="" />
		<div class="flex flex-col">
			<h2 class="m-0 text-base!">{$_("ML_LIVE_SENSES")}</h2>
			<span class="text-xs text-on-secondary-muted">{$_("ML_LIVE_SENSES_DESC")}</span>
		</div>
	</div>

	{#each MLState.snapshot as sensor}
		{@const name = sensor.type.renderName(sensor.settings)}
		<div class="flex flex-col gap-1.5">
			<div class="flex justify-between gap-2 text-sm">
				<span>{$_(name.translation, { values: name.values })}</span>
				{#if sensor.type.type !== "lidar"}
					<span class="tabular-nums text-on-secondary-muted">{(sensor.values[0] || 0).toFixed(2)}</span>
				{/if}
			</div>
			{#if sensor.type.type === "lidar"}
				<Lidar values={sensor.values} />
			{:else}
				<div class="h-2 overflow-hidden rounded-full bg-secondary">
					<div class="h-full rounded-full bg-accent transition-[width] duration-100" style:width={`${Math.max(0, Math.min(1, sensor.values[0] || 0)) * 100}%`}></div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="text-sm text-on-secondary-muted">{$_("ML_WAITING_FOR_DATA")}</div>
	{/each}
</section>
