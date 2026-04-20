<script lang="ts">
import { faBluetooth } from "@fortawesome/free-brands-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { ml } from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import type { Snippet } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import Button from "$components/ui/Button.svelte";
import Switch from "$components/ui/Switch.svelte";
import AssignKey from "$components/workspace/ml/AssignKey.svelte";
import RobotStatus from "$components/workspace/ml/RobotStatus.svelte";
import MLState from "$state/ml.svelte";
</script>

{#if !MLState.connected}
	<div class="absolute top-0 left-0 right-0 bottom-0">
		<div class="flex justify-between items-center bg-primary text-on-primary px-10 py-5 text-left">
			<div class="flex flex-col gap-2.5">
				<div class="font-bold text-xl">{$_("ML_NOT_CONNECTED")}</div>
				<div>{$_("ML_NOT_CONNECTED_DESC")}</div>
			</div>
			<Button mode="accent" name={$_("ML_CONNECT")} icon={faBluetooth} onclick={() => MLState.connect()} />
		</div>
	</div>
{/if}

<div class="{!MLState.connected ? 'pt-16 opacity-40 pointer-events-none' : ''}">
	<div class="flex gap-10">
		<RobotStatus />
		<div class="flex flex-col items-center justify-center gap-8">
			<div class="flex flex-col gap-5">
				<h1 class="m-0">{$_("ML_COLLECT_TITLE")}</h1>
				<span>{$_("ML_COLLECT_DESC")}</span>
			</div>

			{#snippet tableRow(children: Snippet)}
				<div class="flex justify-between items-center border-b-2 border-black/15 px-5 py-2.5 first:pt-4 last:pb-4 last:border-b-0">
					{@render children()}
				</div>
			{/snippet}

			<div class="flex flex-col gap-0.5 bg-secondary rounded-2xl overflow-hidden w-full">
				{#each MLState.classes as classData (classData.id)}
					{#snippet classRowContent()}<div class="font-bold">{classData.name}</div><AssignKey {classData} />{/snippet}
					{@render tableRow(classRowContent)}
				{/each}
			</div>

			<div class="flex flex-col gap-0.5 bg-secondary rounded-2xl overflow-hidden w-full">
				{#snippet recordRowContent()}
					<div class="flex flex-col text-left gap-2.5">
						<div class="font-bold">{MLState.learning ? MLState.classification ? $_("ML_RECORDING_FOR", { values: { target: ml.classes.getItem(MLState.classification).name } }) : $_("ML_RECORDING") : $_("ML_RECORD")}</div>
						<Switch name={$_("ML_MANUAL")} bind:checked={MLState.manual} />
					</div>
					<button onclick={() => MLState.learn()} class="record {MLState.learning ? 'recording' : ''}" aria-label="record"></button>
				{/snippet}
				{@render tableRow(recordRowContent)}

				{#each MLState.datasets.toReversed() as dataset (dataset.id)}
					{#snippet datasetRowContent()}
						<div>Dataset {dataset.date.toLocaleString()}</div>
						<button onclick={() => ml.datasets.deleteItem(dataset.id)} class="bg-none border-none outline-none text-[salmon] text-xl aspect-square flex items-center justify-center cursor-pointer"><Fa icon={faTrash} /></button>
					{/snippet}
					{@render tableRow(datasetRowContent)}
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.record {
		--size: 40px;
		position: relative;
		border: none;
		background: var(--background);
		border-radius: 100%;
		width: var(--size);
		height: var(--size);
		cursor: pointer;
	}
	.record:before {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: calc(var(--size) - 6px);
		height: calc(var(--size) - 6px);
		border-radius: 50%;
		background: salmon;
		transition: 0.2s ease;
	}
	.record.recording:before {
		width: calc(var(--size) / 2);
		height: calc(var(--size) / 2);
		border-radius: 5px;
	}
</style>
