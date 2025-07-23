<script>
	import MLState, {steps} from "$state/ml.svelte.js"
	import ComponentRenderer from "$components/ui/ComponentRenderer.svelte";
	import Button from "$components/ui/Button.svelte";
	import { _ } from "svelte-i18n"
	import {faArrowLeft, faArrowRight, faChevronLeft, faChevronRight} from "@fortawesome/free-solid-svg-icons";
	import RobotStatus from "$components/workspace/ml/RobotStatus.svelte";
</script>

<div class="container">
	<div class="content">
		<ComponentRenderer component={MLState.step} />

		<div class="footer">
			<div class="spacer"></div>
			<div class="pager">
				<Button onclick={() => MLState.previous()} bold disabled={MLState.stepIndex === 0} mode="secondary" name={$_("PREVIOUS")} icon={faArrowLeft} />
				<span class="page">{$_("ML_STEP", { values: { step: MLState.stepIndex + 1, total: steps.length }})}</span>
				<Button onclick={() => MLState.next()} bold disabled={MLState.stepIndex >= MLState.maxStep} mode="primary" name={$_("NEXT")} icon={faArrowRight} iconAlign="right" />
			</div>
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;

		position: absolute;
		top: 0;
		height: var(--full-height);
		width: 100vw;
	}

	.content {
		display: grid;
		grid-template-rows: 1fr auto;
		gap: 40px;

		overflow-y: auto;
		position: relative;
		background: var(--background);
		box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);

		border-radius: 40px;
		width: 1000px;
		max-height: 600px;
		padding: 60px 40px;
	}

	.spacer {
		width: 100%;
		height: 4px;
		border-radius: 5px;
		background: var(--secondary);
	}

	.footer {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.pager {
		position: relative;
		display: flex;
		justify-content: space-between;
	}
	.page {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}
</style>
