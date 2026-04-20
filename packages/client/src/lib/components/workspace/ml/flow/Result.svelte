<script lang="ts">
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { ml } from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import { _ } from "svelte-i18n";
import Button from "$components/ui/Button.svelte";
import ModelVisualizer from "$components/workspace/ml/visualizer/ModelVisualizer.svelte";
import MLState from "$state/ml.svelte";
import PopupState from "$state/popup.svelte";

async function upload() {
	ml.generateInference = true;
	await MLState.upload();
	ml.generateInference = false;
}

async function playground() {
	await PopupState.open({
		component: ModelVisualizer,
		data: {},
		allowInteraction: true,
	});
}
</script>

<div class="flex flex-col items-center justify-center gap-8">
	<div class="flex flex-col gap-5">
		<h1 class="m-0">{$_("ML_UPLOAD_TITLE")}</h1>
		<span>{$_("ML_UPLOAD_DESC")}</span>
	</div>

	<table class="w-full border-collapse my-5 font-sans">
		<thead>
		<tr>
			<th class="border border-[#ccc] px-3 py-2.5 text-center bg-[#f2f2f2] font-bold"></th>
			<th colspan={MLState.classes.length} class="border border-[#ccc] px-3 py-2.5 text-center bg-[#e0e0e0] font-bold">{$_("ML_PREDICTED")}</th>
		</tr>
		<tr>
			<th class="border border-[#ccc] px-3 py-2.5 text-center bg-[#e0e0e0] font-bold whitespace-nowrap">{$_("ML_ACTUAL")}</th>
			{#each MLState.classes as classData}
				<th class="border border-[#ccc] px-3 py-2.5 text-center bg-[#f2f2f2] font-bold">{classData.name}</th>
			{/each}
		</tr>
		</thead>
		<tbody>
		{#each MLState.confusion as row, rowIndex}
			<tr>
				<th class="border border-[#ccc] px-3 py-2.5 text-center bg-[#f2f2f2] font-bold">{MLState.classes[rowIndex].name}</th>
				{#each row as value, valueIndex}
					<td
						class="matrix-value border border-[#ccc] px-3 py-2.5 text-center relative z-[1]"
						style:--bg-color={valueIndex === rowIndex ? "lightgreen" : "salmon"}
						style:--bg-opacity={value}
					>
						{Math.round(value * 100)}%
					</td>
				{/each}
			</tr>
		{/each}
		</tbody>
	</table>

	<div class="flex gap-5">
		<Button onclick={playground} disabled={!MLState.model} mode="secondary" icon={faPlay} name={$_("ML_OPEN_PLAYGROUND")} />
		<Button onclick={upload} large bold mode="primary" icon={faUsb} name={$_("UPLOAD")} />
	</div>
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
