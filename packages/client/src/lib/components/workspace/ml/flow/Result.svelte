<script lang="ts">
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import { faPlay, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { _ } from "svelte-i18n";
import Button from "$components/ui/Button.svelte";
import StatusBanner from "$components/ui/StatusBanner.svelte";
import StepIntro from "$components/workspace/ml/StepIntro.svelte";
import ModelVisualizer from "$components/workspace/ml/visualizer/ModelVisualizer.svelte";
import MLState from "$state/ml.svelte";
import PopupState from "$state/popup.svelte";

// Mix-ups below this share are normal noise and not worth pointing out
const MIXUP_THRESHOLD = 0.15;

const confusion = $derived(MLState.confusion ?? []);

// Average of the correct answers per class, so every class counts equally
const score = $derived.by(() => {
	const diagonal = confusion
		.map((row, index) => row[index])
		.filter((value) => Number.isFinite(value));
	if (diagonal.length === 0) return null;
	return diagonal.reduce((acc, value) => acc + value, 0) / diagonal.length;
});

const biggestMixup = $derived.by(() => {
	let result: { actual: number; predicted: number; value: number } | null =
		null;
	for (const [actual, row] of confusion.entries()) {
		for (const [predicted, value] of row.entries()) {
			if (actual === predicted || !Number.isFinite(value)) continue;
			if (value > (result?.value ?? MIXUP_THRESHOLD))
				result = { actual, predicted, value };
		}
	}
	return result;
});

async function playground() {
	await PopupState.open({
		component: ModelVisualizer,
		data: {},
		allowInteraction: true,
	});
}
</script>

<div class="flex flex-col gap-5">
	<StepIntro title={$_("ML_UPLOAD_TITLE")} description={$_("ML_UPLOAD_DESC")} />

	{#if score !== null}
		<section class="flex items-center gap-4 rounded-2xl bg-bg-tint p-4 text-left">
			<div class="text-4xl font-extrabold tabular-nums {score >= 0.8 ? 'text-success' : score >= 0.5 ? 'text-amber-600' : 'text-danger'}">{Math.round(score * 100)}%</div>
			<div class="flex flex-col gap-1">
				<div class="text-base font-bold">{$_("ML_EXAM_SCORE")}</div>
				<div class="text-sm text-on-secondary-muted">{$_("ML_EXAM_SCORE_DESC")}</div>
			</div>
		</section>

		{#if biggestMixup}
			<StatusBanner
				kind="warning"
				title={$_("ML_MIXUP", { values: {
					actual: MLState.classes[biggestMixup.actual]?.name,
					predicted: MLState.classes[biggestMixup.predicted]?.name,
					percent: Math.round(biggestMixup.value * 100),
				} })}
				message={$_("ML_MIXUP_HINT")}
			/>
		{:else}
			<StatusBanner kind="success" title={$_("ML_NO_MIXUPS")} message={$_("ML_NO_MIXUPS_HINT")} />
		{/if}

		<section class="flex flex-col gap-2 text-left">
			<h2 class="m-0 text-base!">{$_("ML_EXAM_DETAILS")}</h2>
			<span class="text-sm text-on-secondary-muted">{$_("ML_EXAM_DETAILS_DESC")}</span>
			<table class="w-full border-collapse overflow-hidden rounded-2xl">
				<thead>
					<tr>
						<th class="bg-bg-tint px-3 py-1.5"></th>
						<th colspan={MLState.classes.length} class="bg-bg-tint px-3 py-1.5 text-center">{$_("ML_PREDICTED")}</th>
					</tr>
					<tr>
						<th class="bg-bg-tint px-3 py-1.5 text-left whitespace-nowrap">{$_("ML_ACTUAL")}</th>
						{#each MLState.classes as classData}
							<th class="bg-bg-tint px-3 py-1.5 text-center">{classData.name}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each confusion as row, rowIndex}
						<tr>
							<th class="bg-bg-tint px-3 py-1.5 text-left">{MLState.classes[rowIndex]?.name}</th>
							{#each row as value, valueIndex}
								<td
									class="matrix-value relative z-[1] border-2 border-bg px-3 py-1.5 text-center tabular-nums"
									style:--bg-color={valueIndex === rowIndex ? "var(--success)" : "var(--danger)"}
									style:--bg-opacity={Number.isFinite(value) ? value * 0.6 : 0}
								>
									{Number.isFinite(value) ? `${Math.round(value * 100)}%` : "–"}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
	{/if}

	<section class="flex flex-col gap-3 text-left">
		<h2 class="m-0 text-base!">{$_("ML_PUT_ON_ROBOT")}</h2>
		{#if MLState.modelUpload === "uploading"}
			<StatusBanner kind="loading" title={$_("ML_UPLOADING")} message={$_("ML_UPLOADING_DESC")} />
		{:else if MLState.modelUpload === "error"}
			<StatusBanner kind="error" title={$_("ML_UPLOAD_FAILED")} message={$_("ML_UPLOAD_FAILED_DESC")}>
				{#snippet actions()}
					<Button onclick={() => MLState.uploadModel()} mode="secondary" icon={faRotateRight} name={$_("TRY_AGAIN")} />
				{/snippet}
			</StatusBanner>
		{:else if MLState.modelUpload === "success"}
			<StatusBanner kind="success" title={$_("ML_MODEL_UPLOADED")} message={$_("ML_MODEL_UPLOADED_DESC")} />
		{:else}
			<StatusBanner kind="info" title={$_("ML_READY_TO_UPLOAD_MODEL")} message={$_("ML_READY_TO_UPLOAD_MODEL_DESC")}>
				{#snippet actions()}
					<Button onclick={() => MLState.uploadModel()} mode="accent" bold icon={faUsb} name={$_("UPLOAD")} />
				{/snippet}
			</StatusBanner>
		{/if}
		<div class="flex flex-col gap-1">
			<div><Button onclick={playground} disabled={!MLState.model} mode="secondary" icon={faPlay} name={$_("ML_OPEN_PLAYGROUND")} /></div>
			<span class="text-sm text-on-secondary-muted">{MLState.model ? $_("ML_PLAYGROUND_HINT") : $_("ML_PLAYGROUND_UNAVAILABLE")}</span>
		</div>
	</section>
</div>

<style>
	.matrix-value:before {
		content: "";
		position: absolute;
		inset: 0;
		z-index: -1;
		background-color: var(--bg-color);
		opacity: var(--bg-opacity);
	}
</style>
