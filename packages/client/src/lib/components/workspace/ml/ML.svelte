<script lang="ts">
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { _ } from "svelte-i18n";
import Button from "$components/ui/Button.svelte";
import ComponentRenderer from "$components/ui/ComponentRenderer.svelte";
import GuidePanel from "$components/ui/GuidePanel.svelte";
import Stepper from "$components/ui/Stepper.svelte";
import RobotStatus from "$components/workspace/ml/RobotStatus.svelte";
import MLState, { steps } from "$state/ml.svelte.js";
import { getGuides } from "./guide";

const guides = $derived(getGuides());
const guide = $derived(guides[MLState.stepIndex]);
const nextGuide = $derived(guides[MLState.stepIndex + 1]);
const isLast = $derived(MLState.stepIndex >= steps.length - 1);
const nextLocked = $derived(!isLast && MLState.stepIndex >= MLState.maxStep);
</script>

<div class="absolute top-0 left-0 flex h-[var(--full-height)] w-screen flex-col bg-bg-tint text-on-bg">
	<header class="bg-bg px-4 py-2">
		<Stepper
			current={MLState.stepIndex}
			onselect={(index) => MLState.goTo(index)}
			steps={guides.map((step, index) => ({
				title: $_(step.title),
				done: index < MLState.maxStep,
				locked: index > MLState.maxStep,
				reason: step.lockedReason ? $_(step.lockedReason) : undefined,
			}))}
		/>
	</header>

	<div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_300px] gap-4 p-4 text-sm max-[900px]:grid-cols-1 max-[900px]:overflow-auto">
		<main class="min-h-0 overflow-auto rounded-2xl bg-bg p-5">
			<ComponentRenderer component={MLState.step} />
		</main>

		<aside class="flex min-h-0 flex-col gap-3 overflow-auto">
			<GuidePanel
				title={$_("ML_WHAT_TO_DO")}
				items={guide.checklist.map((item) => ({ label: $_(item.key, { values: item.values }), done: item.done }))}
				tip={{ title: $_(guide.tip.title), text: $_(guide.tip.text) }}
			/>
			{#if MLState.connected}
				<RobotStatus />
			{/if}
		</aside>
	</div>

	<footer class="flex items-center justify-between gap-4 bg-bg px-4 py-2">
		<Button onclick={() => MLState.previous()} disabled={MLState.stepIndex === 0} mode="secondary" name={$_("PREVIOUS")} icon={faArrowLeft} />
		<span class="text-center text-sm text-on-secondary-muted">
			{#if isLast}
				{$_("ML_FINISH_HINT")}
			{:else if nextLocked}
				{$_(nextGuide.lockedReason)}
			{:else}
				{$_("ML_STEP", { values: { step: MLState.stepIndex + 1, total: steps.length } })}
			{/if}
		</span>
		<Button onclick={() => MLState.next()} disabled={isLast || nextLocked} mode="primary" name={$_("NEXT")} icon={faArrowRight} iconAlign="right" />
	</footer>
</div>
