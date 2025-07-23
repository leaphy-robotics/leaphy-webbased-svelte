<script lang="ts">
interface Props {
	layers: number[];
}
let { layers = [] }: Props = $props();

const nodeRadius = 15;
const layerSpacing = 150;
const nodeSpacing = 40;
const inputColor = "#4CAF50";
const outputColor = "#F44336";
const hiddenColor = "#2196F3";
const lineColor = "#9E9E9E";
const strokeWidth = 1.5;

let maxNodesInLayer = $derived(Math.max(...layers, 0));
let svgWidth = $derived(
	(layers.length - 1) * layerSpacing + 2 * nodeRadius + 50,
);
let svgHeight = $derived(maxNodesInLayer * nodeSpacing + 2 * nodeRadius + 50);

function getNodeY(numNodes: number, nodeIndex: number) {
	const startY = (svgHeight - numNodes * nodeSpacing) / 2;
	return startY + nodeIndex * nodeSpacing;
}

function getNodeColor(layerIndex: number) {
	if (layerIndex === 0) {
		return inputColor;
	}

	if (layerIndex === layers.length - 1) {
		return outputColor;
	}

	return hiddenColor;
}
</script>

<div class="ml-model-container">
	<svg
		width={svgWidth}
		height={svgHeight}
		viewBox={`0 0 ${svgWidth} ${svgHeight}`}
		class="model-svg"
	>
		<!-- Draw connections between layers -->
		{#each layers as currentLayerNodes, i}
			{#if i < layers.length - 1}
				{@const nextLayerNodes = layers[i + 1]}
				{#each Array(currentLayerNodes) as _, j}
					{#each Array(nextLayerNodes) as __, k}
						<line
							x1={i * layerSpacing + nodeRadius + 25}
							y1={getNodeY(currentLayerNodes, j) + nodeRadius + 25}
							x2={(i + 1) * layerSpacing + nodeRadius + 25}
							y2={getNodeY(nextLayerNodes, k) + nodeRadius + 25}
							stroke={lineColor}
							stroke-width={strokeWidth}
						/>
					{/each}
				{/each}
			{/if}
		{/each}

		<!-- Draw nodes for each layer -->
		{#each layers as numNodes, i}
			{#each Array(numNodes) as _, j}
				<circle
					cx={i * layerSpacing + nodeRadius + 25}
					cy={getNodeY(numNodes, j) + nodeRadius + 25}
					r={nodeRadius}
					fill={getNodeColor(i)}
					stroke="#333"
					stroke-width="1"
				/>
			{/each}
		{/each}
	</svg>
</div>

<style>
	.ml-model-container {
		padding: 1rem;
		background-color: #f9fafb;
		border-radius: 0.5rem 0 0 0.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow-x: auto;
		width: 300px;
	}

	.model-svg {
		display: block;
	}

	.placeholder-text {
		color: #4b5563;
		font-family: sans-serif;
	}
</style>
