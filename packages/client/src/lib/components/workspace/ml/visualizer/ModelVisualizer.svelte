<script lang="ts">
import Windowed from "$components/core/popups/Windowed.svelte";
import { ModelVisualizer } from "$components/workspace/ml/visualizer/ModelVisualizer";
import MLState from "$state/ml.svelte";
import { onMount } from "svelte";
import { _ } from "svelte-i18n";

let visualizationContainer = $state<HTMLDivElement>();
let controlsContainer = $state<HTMLDivElement>();
let outputContainer = $state<HTMLDivElement>();

onMount(() => {
	new ModelVisualizer(
		MLState.model,
		visualizationContainer,
		controlsContainer,
		outputContainer,
		{
			inputLabels: MLState.sensors.map((sensor) => {
				const name = sensor.type.renderName(sensor.settings);
				return $_(name.translation, { values: name.values });
			}),
			outputLabels: MLState.classes.map((classData) => classData.name),
		},
	);
});
</script>

<Windowed title={$_("ML_PLAYGROUND")}>
	<div class="content">
		<div class="visualization" bind:this={visualizationContainer}></div>
		<div class="controls" bind:this={controlsContainer}></div>
		<div class="output" bind:this={outputContainer}></div>
	</div>
</Windowed>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 30px;
	}

	.visualization {
		flex: 1;
	}

	.controls {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
