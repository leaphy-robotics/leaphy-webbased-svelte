<script lang="ts">
import {
	faArrowRight,
	faBrain,
	faRotateRight,
	faSliders,
} from "@fortawesome/free-solid-svg-icons";
import { _ } from "svelte-i18n";
import ModelStructure from "$components/core/popups/popups/ModelStructure.svelte";
import Button from "$components/ui/Button.svelte";
import Disclosure from "$components/ui/Disclosure.svelte";
import Field from "$components/ui/Field.svelte";
import LineChart from "$components/ui/LineChart.svelte";
import ProgressBar from "$components/ui/ProgressBar.svelte";
import StatusBanner from "$components/ui/StatusBanner.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import StepIntro from "$components/workspace/ml/StepIntro.svelte";
import MLState, { MIN_SAMPLES_PER_CLASS } from "$state/ml.svelte";
import PopupState from "$state/popup.svelte";

const busy = $derived(
	MLState.trainingState === "training" ||
		MLState.trainingState === "converting",
);
const lastPoint = $derived(
	MLState.trainingHistory[MLState.trainingHistory.length - 1],
);

function editModel() {
	PopupState.open({
		component: ModelStructure,
		data: {},
		allowInteraction: false,
	});
}
</script>

<div class="flex flex-col gap-5">
	<StepIntro title={$_("ML_TRAIN_TITLE")} description={$_("ML_TRAIN_DESC")} />

	<section class="flex flex-col gap-3 text-left">
		<div class="flex flex-col">
			<h2 class="m-0 text-base!">{$_("ML_EXAMPLES_PER_CLASS")}</h2>
			<span class="text-sm text-on-secondary-muted">{$_("ML_EXAMPLES_PER_CLASS_DESC")}</span>
		</div>
		<div class="flex flex-col overflow-hidden rounded-2xl bg-bg-tint">
			{#each MLState.classes as classData, index (classData.id)}
				{@const available = MLState.available[index] ?? 0}
				<div class="grid grid-cols-[minmax(0,1fr)_minmax(120px,240px)_110px] items-center gap-4 border-b-2 border-secondary px-4 py-2 last:border-b-0">
					<div class="flex flex-col">
						<span class="truncate font-bold">{classData.name}</span>
						<span class="text-sm text-on-secondary-muted">{$_("ML_EXAMPLES_RECORDED", { values: { count: available } })}</span>
					</div>
					<div class="h-2 overflow-hidden rounded-full bg-secondary">
						<div class="h-full rounded-full {available >= MIN_SAMPLES_PER_CLASS ? 'bg-success' : 'bg-warning'}" style:width={`${Math.min(100, (available / Math.max(1, ...MLState.available)) * 100)}%`}></div>
					</div>
					<label class="flex flex-col gap-0.5 text-xs text-on-secondary-muted">
						{$_("ML_USE_EXAMPLES")}
						<TextInput type="number" min={1} max={available} bind:value={MLState.distribution[index]} mode="background" rounded={true} />
					</label>
				</div>
			{/each}
		</div>
		{#if MLState.trainingIssues.length > 0}
			<StatusBanner
				kind="warning"
				title={$_("ML_NOT_ENOUGH_EXAMPLES")}
				message={MLState.trainingIssues.map((issue) => $_(issue.key, { values: issue.values })).join(" ")}
			/>
		{/if}
	</section>

	<Disclosure title={$_("ML_ADVANCED")}>
		<div class="flex flex-col gap-4">
			<Field label={$_("ML_EPOCHS")} hint={$_("ML_EPOCHS_HINT")}>
				<div class="w-40"><TextInput type="number" min={1} max={1000} bind:value={MLState.epochs} mode="secondary" rounded={true} /></div>
			</Field>
			<Field label={$_("ML_MODEL_STRUCTURE")} hint={$_("ML_MODEL_STRUCTURE_HINT")}>
				<div><Button onclick={editModel} mode="secondary" icon={faSliders} name={$_("ML_ADVANCED_EDIT_MODEL")} /></div>
			</Field>
		</div>
	</Disclosure>

	<section class="flex flex-col gap-3 text-left">
		{#if MLState.trainingState === "training" && !lastPoint}
			<StatusBanner kind="loading" title={$_("ML_TRAINING_PREPARING")} message={$_("ML_TRAINING_PREPARING_DESC")} />
			<ProgressBar progress={0} indeterminate />
		{:else if MLState.trainingState === "training"}
			<StatusBanner
				kind="loading"
				title={$_("ML_TRAINING_PROGRESS", { values: { epoch: lastPoint?.epoch ?? 0, total: MLState.epochs } })}
				message={$_("ML_TRAINING_PROGRESS_DESC")}
			/>
			<ProgressBar progress={((lastPoint?.epoch ?? 0) / MLState.epochs) * 100} />
		{:else if MLState.trainingState === "converting"}
			<StatusBanner kind="loading" title={$_("ML_CONVERTING")} message={$_("ML_CONVERTING_DESC")} />
			<ProgressBar progress={0} indeterminate />
		{:else if MLState.trainingState === "error"}
			<StatusBanner kind="error" title={$_("ML_TRAINING_FAILED")} message={MLState.trainingError ? $_(MLState.trainingError) : undefined}>
				{#snippet actions()}
					<Button mode="secondary" icon={faRotateRight} name={$_("TRY_AGAIN")} onclick={() => MLState.train()} />
				{/snippet}
			</StatusBanner>
		{:else if MLState.isTrained}
			<StatusBanner kind="success" title={$_("ML_TRAINING_DONE")} message={$_("ML_TRAINING_DONE_DESC")}>
				{#snippet actions()}
					<Button mode="secondary" icon={faArrowRight} iconAlign="right" name={$_("ML_SEE_RESULTS")} onclick={() => MLState.next()} />
				{/snippet}
			</StatusBanner>
		{/if}

		{#if MLState.trainingHistory.length > 0}
			<div class="flex flex-col gap-1 rounded-2xl bg-bg-tint p-4">
				<div class="flex justify-between text-sm">
					<strong>{$_("ML_MISTAKES")}</strong>
					{#if lastPoint}<span class="text-on-secondary-muted">{$_("ML_PRACTICE_SCORE", { values: { accuracy: Math.round(lastPoint.accuracy * 100) } })}</span>{/if}
				</div>
				<span class="text-xs text-on-secondary-muted">{$_("ML_MISTAKES_DESC")}</span>
				<LineChart values={MLState.trainingHistory.map((point) => point.loss)} label={$_("ML_MISTAKES")} />
			</div>
		{/if}

		<div>
			<Button
				onclick={() => MLState.train()}
				bold
				mode="primary"
				icon={faBrain}
				disabled={busy || MLState.trainingIssues.length > 0}
				name={MLState.isTrained ? $_("ML_TRAIN_AGAIN") : $_("ML_TRAIN")}
			/>
		</div>
	</section>
</div>
