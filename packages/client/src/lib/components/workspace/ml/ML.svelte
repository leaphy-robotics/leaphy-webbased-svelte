<script>
import Button from "$components/ui/Button.svelte";
import ComponentRenderer from "$components/ui/ComponentRenderer.svelte";
import RobotStatus from "$components/workspace/ml/RobotStatus.svelte";
import MLState, { steps } from "$state/ml.svelte.js";
import {
	faArrowLeft,
	faArrowRight,
	faChevronLeft,
	faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { _ } from "svelte-i18n";
</script>

<div class="flex justify-center items-center text-center absolute top-0 h-[var(--full-height)] w-screen">
	<div class="grid grid-rows-[1fr_auto] gap-10 overflow-y-auto relative bg-bg shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] rounded-[40px] w-[1000px] max-h-[600px] px-10 py-16">
		<ComponentRenderer component={MLState.step} />

		<div class="flex flex-col gap-5">
			<div class="w-full h-1 rounded-md bg-secondary"></div>
			<div class="relative flex justify-between">
				<Button onclick={() => MLState.previous()} bold disabled={MLState.stepIndex === 0} mode="secondary" name={$_("PREVIOUS")} icon={faArrowLeft} />
				<span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">{$_("ML_STEP", { values: { step: MLState.stepIndex + 1, total: steps.length }})}</span>
				<Button onclick={() => MLState.next()} bold disabled={MLState.stepIndex >= MLState.maxStep} mode="primary" name={$_("NEXT")} icon={faArrowRight} iconAlign="right" />
			</div>
		</div>
	</div>
</div>
