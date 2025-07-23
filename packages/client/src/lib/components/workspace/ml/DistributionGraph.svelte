<script lang="ts">
import {
	ArcElement,
	Chart,
	type ChartData,
	Legend,
	PieController,
	Tooltip,
} from "chart.js";
import { onDestroy, onMount } from "svelte";

// Register required components
Chart.register(PieController, ArcElement, Tooltip, Legend);

interface Props {
	data: { name: string; value: number }[];
}
let { data }: Props = $props();

let canvas: HTMLCanvasElement;
let chart: Chart | null = null;

function updateData(data: { name: string; value: number }[]) {
	chart.data = {
		labels: data.map((d) => d.name),
		datasets: [
			{
				data: data.map((d) => d.value),
				backgroundColor: [
					"#FF6384",
					"#36A2EB",
					"#FFCE56",
					"#4BC0C0",
					"#9966FF",
					"#FF9F40",
				],
				hoverOffset: 4,
			},
		],
	};
	chart.update();
}

onMount(() => {
	if (canvas && data?.length) {
		chart = new Chart(canvas, {
			type: "pie",
			data: {
				datasets: [],
			},
			options: {
				responsive: true,
				plugins: {
					legend: {
						position: "right",
					},
				},
			},
		});
	}

	updateData(data);
});

$effect(() => {
	updateData(data);
});

onDestroy(() => {
	chart?.destroy();
});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
