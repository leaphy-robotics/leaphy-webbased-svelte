<script>
	import MLState, {steps} from "$state/ml.svelte.js"
	import ComponentRenderer from "$components/ui/ComponentRenderer.svelte";
</script>

<div class="container">
	<div class="content">
		<div class="scrollable">
			<ComponentRenderer component={MLState.step} />
		</div>

		<div class="steps">
			{#each steps as _step, i}
				<div class="step" class:past={i < MLState.stepIndex} class:active={i === MLState.stepIndex}>{i + 1}</div>
			{/each}
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
		position: relative;
		background: var(--background);
		box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);

		border-radius: 40px;
		width: 1000px;
		max-height: 600px;
	}

	.scrollable {
		padding: 60px 40px;
		overflow-y: auto;
	}

	.steps {
		display: flex;
		position: absolute;
		left: 50%;
		bottom: 0;
		translate: -50% 50%;
		gap: 20px;
	}

	.step {
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--secondary);
		font-size: 18px;
		width: 36px;
		height: 36px;
		border-radius: 20px;
		background-clip: content-box;
		padding: 2px;
		border: 3px solid var(--secondary);
	}

	.step.active {
		color: var(--on-accent);
		background: var(--accent);
		background-clip: content-box;
		border: 3px solid var(--accent);
	}

	.step.past {
		color: var(--on-primary);
		background: var(--primary-dark-tint);
		background-clip: content-box;
		border: 3px solid var(--primary-dark-tint);
	}
</style>
