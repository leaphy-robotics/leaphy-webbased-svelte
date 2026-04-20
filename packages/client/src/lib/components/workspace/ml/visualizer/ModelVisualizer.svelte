<script lang="ts">
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import Windowed from "$components/core/popups/Windowed.svelte";
import { ModelVisualizer } from "$components/workspace/ml/visualizer/ModelVisualizer";
import MLState from "$state/ml.svelte";

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
	<div class="flex flex-col items-center gap-2.5 p-8">
		<div class="flex-1" bind:this={visualizationContainer}></div>
		<div class="flex flex-col items-center" bind:this={controlsContainer}></div>
		<div bind:this={outputContainer}></div>
	</div>
</Windowed>
