<script lang="ts">
import {
	Chart,
	Colors,
	Legend,
	LineController,
	LineElement,
	LinearScale,
	PointElement,
	TimeScale,
} from "chart.js";
import { onMount } from "svelte";
import "chartjs-adapter-date-fns";
import { charts } from "$state/workspace.svelte";
import { Tooltip } from "chart.js";
import { enUS, nl } from "date-fns/locale";
import { locale } from "svelte-i18n";
import { get } from "svelte/store";

Chart.register(
	TimeScale,
	LineController,
	LinearScale,
	PointElement,
	LineElement,
	Colors,
	Tooltip,
	Legend,
);

let chart: Chart<"line", { x: Date; y: number }[], unknown>;
function updateDatasets(charts: Record<string, { x: Date; y: number }[]>) {
	if (!chart) return;

	chart.data.datasets = chart.data.datasets.filter(
		(set) => set.label in charts,
	);
	for (const [name, contents] of Object.entries(charts)) {
		let dataset = chart.data.datasets.find(({ label }) => label === name);
		if (!dataset) {
			dataset = {
				label: name,
				data: [],
			};
			chart.data.datasets.push(dataset);
		}

		dataset.data = contents;
	}

	chart.update();
}

let element: HTMLCanvasElement;
onMount(() => {
	chart = new Chart(element, {
		type: "line",
		options: {
			scales: {
				x: {
					type: "time",
					time: {
						unit: "second",
						displayFormats: {
							second: "HH:mm:ss",
						},
					},
					adapters: {
						date: {
							locale: get(locale) === "nl" ? nl : enUS,
						},
					},
				},
			},
			animation: false,
		},
		data: {
			datasets: [],
		},
	});

	updateDatasets(get(charts));
});

charts.subscribe(updateDatasets);
</script>

<canvas bind:this={element}></canvas>

<style>
	canvas {
		width: 785px;
		height: 400px;
	}
</style>
