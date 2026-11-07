<script lang="ts">
import { faBluetooth } from "@fortawesome/free-brands-svg-icons";
import { faRotateRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ml } from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import Button from "$components/ui/Button.svelte";
import Locked from "$components/ui/Locked.svelte";
import StatusBanner from "$components/ui/StatusBanner.svelte";
import Switch from "$components/ui/Switch.svelte";
import AssignKey from "$components/workspace/ml/AssignKey.svelte";
import StepIntro from "$components/workspace/ml/StepIntro.svelte";
import MLState, { MIN_SAMPLES_PER_CLASS } from "$state/ml.svelte";

const hasKeys = $derived(MLState.classes.some((classData) => !!classData.key));

function count(index: number, classId: string) {
	return (
		(MLState.available[index] ?? 0) + (MLState.sessionCounts[classId] ?? 0)
	);
}
</script>

<div class="flex flex-col gap-5">
	<StepIntro title={$_("ML_COLLECT_TITLE")} description={$_("ML_COLLECT_DESC")} />

	{#if MLState.connectionState === "connecting"}
		<StatusBanner kind="loading" title={$_("ML_CONNECTING")} message={$_("ML_CONNECTING_DESC")} />
	{:else if MLState.connectionState === "lost"}
		<StatusBanner kind="warning" title={$_("ML_CONNECTION_LOST")} message={$_("ML_CONNECTION_LOST_DESC")}>
			{#snippet actions()}
				<Button mode="secondary" icon={faBluetooth} name={$_("ML_RECONNECT")} onclick={() => MLState.connect()} />
			{/snippet}
		</StatusBanner>
	{:else if MLState.connectionState === "error"}
		<StatusBanner kind="error" title={$_("ML_CONNECTION_FAILED")} message={MLState.connectionError ?? undefined}>
			{#snippet actions()}
				<Button mode="secondary" icon={faRotateRight} name={$_("TRY_AGAIN")} onclick={() => MLState.connect()} />
			{/snippet}
		</StatusBanner>
	{:else if MLState.connectionState === "disconnected"}
		<StatusBanner kind="info" title={$_("ML_NOT_CONNECTED")} message={$_("ML_NOT_CONNECTED_DESC")}>
			{#snippet actions()}
				<Button mode="accent" icon={faBluetooth} name={$_("ML_CONNECT")} onclick={() => MLState.connect()} />
			{/snippet}
		</StatusBanner>
	{:else}
		<StatusBanner kind="success" compact title={$_("ML_CONNECTED")} />
	{/if}

	<Locked locked={!MLState.connected} reason={$_("ML_LOCKED_NOT_CONNECTED")}>
		<div class="flex flex-col gap-5">
			<section class="flex flex-col gap-3 text-left">
				<div class="flex flex-col">
					<h2 class="m-0 text-base!">{$_("ML_YOUR_CLASSES")}</h2>
					<span class="text-sm text-on-secondary-muted">{$_("ML_YOUR_CLASSES_DESC")}</span>
				</div>
				<div class="flex flex-col overflow-hidden rounded-2xl bg-bg-tint">
					{#each MLState.classes as classData, index (classData.id)}
						{@const examples = count(index, classData.id)}
						<div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(120px,200px)] items-center gap-4 border-b-2 border-secondary px-4 py-2 last:border-b-0
							{MLState.classification === classData.id ? 'bg-primary/15' : ''}">
							<div class="truncate font-bold">{classData.name}</div>
							<AssignKey {classData} />
							<div class="flex flex-col gap-1">
								<span class="text-right text-sm tabular-nums text-on-secondary-muted">{$_("ML_EXAMPLES", { values: { count: examples } })}</span>
								<div class="h-1.5 overflow-hidden rounded-full bg-secondary">
									<div class="h-full rounded-full transition-[width] {examples >= MIN_SAMPLES_PER_CLASS ? 'bg-success' : 'bg-accent'}" style:width={`${Math.min(100, (examples / MIN_SAMPLES_PER_CLASS) * 100)}%`}></div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<section class="flex flex-col gap-3 text-left">
				<div class="flex items-center gap-4 rounded-2xl bg-bg-tint p-4">
					<button
						onclick={() => MLState.learn()}
						disabled={!hasKeys && !MLState.learning}
						class="record {MLState.learning ? 'recording' : ''} disabled:cursor-not-allowed disabled:opacity-50"
						aria-label={MLState.learning ? $_("ML_STOP_RECORDING") : $_("ML_RECORD")}
					></button>
					<div class="flex min-w-0 flex-1 flex-col gap-1" aria-live="polite">
						<div class="text-base font-bold">
							{#if !MLState.learning}
								{$_("ML_RECORD")}
							{:else if MLState.classification}
								{$_("ML_RECORDING_FOR", { values: { target: ml.classes.getItem(MLState.classification).name } })}
							{:else}
								<span class="inline-flex items-center gap-2"><span class="rec-dot"></span>{$_("ML_RECORDING")}</span>
							{/if}
						</div>
						<div class="text-sm text-on-secondary-muted">
							{#if !hasKeys}
								{$_("ML_RECORD_NEEDS_KEYS")}
							{:else if MLState.learning}
								{$_("ML_RECORDING_HINT")}
							{:else}
								{$_("ML_RECORD_HINT")}
							{/if}
						</div>
					</div>
				</div>
				{#if MLState.recordingNotice && !MLState.learning}
					<StatusBanner
						compact
						kind={MLState.recordingNotice.key === "ML_NOTHING_RECORDED" ? "warning" : "success"}
						title={$_(MLState.recordingNotice.key, { values: MLState.recordingNotice.values })}
					/>
				{/if}
				<div class="flex flex-col gap-1">
					<Switch name={$_("ML_MANUAL")} bind:checked={MLState.manual} mode="secondary" />
					<span class="text-sm text-on-secondary-muted">{$_("ML_MANUAL_HINT")}</span>
				</div>
			</section>

			{#if MLState.datasets.length > 0}
				<section class="flex flex-col gap-3 text-left">
					<h2 class="m-0 text-base!">{$_("ML_RECORDINGS")}</h2>
					<div class="flex flex-col overflow-hidden rounded-2xl bg-bg-tint">
						{#each MLState.datasets.toReversed() as dataset (dataset.id)}
							<div class="flex items-center justify-between border-b-2 border-secondary px-5 py-2 last:border-b-0">
								<div>{$_("ML_RECORDING_ITEM", { values: { date: dataset.date.toLocaleString(), count: dataset.data.length } })}</div>
								<button
									onclick={() => ml.datasets.deleteItem(dataset.id)}
									class="grid size-8 cursor-pointer place-items-center rounded-full border-none bg-transparent text-danger hover:bg-secondary"
									aria-label={$_("ML_DELETE_RECORDING")}
								><Fa icon={faTrash} /></button>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	</Locked>
</div>

<style>
	.record {
		--size: 44px;
		position: relative;
		flex-shrink: 0;
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
		width: calc(var(--size) - 8px);
		height: calc(var(--size) - 8px);
		border-radius: 50%;
		background: var(--danger);
		transition: 0.2s ease;
	}
	.record.recording:before {
		width: calc(var(--size) / 2);
		height: calc(var(--size) / 2);
		border-radius: 5px;
	}
	.rec-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--danger);
		animation: pulse 1s ease-in-out infinite;
	}
	@keyframes pulse {
		50% {
			opacity: 0.2;
		}
	}
</style>
