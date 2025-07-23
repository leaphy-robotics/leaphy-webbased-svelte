<script lang="ts">
import Button from "$components/ui/Button.svelte";
import MLState from "$state/ml.svelte";
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import { ml } from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import { _ } from "svelte-i18n";

async function upload() {
	ml.generateInference = true;
	await MLState.upload();
	ml.generateInference = false;
}
</script>

<div class="content-area">
	<div class="header">
		<h1>{$_("ML_UPLOAD_TITLE")}</h1>
		<span>{$_("ML_UPLOAD_DESC")}</span>
	</div>

	<table>
		<thead>
		<tr>
			<th></th> <th colspan={MLState.classes.length} class="header-label">{$_("ML_PREDICTED")}</th>
		</tr>
		<tr>
			<th class="actual-label">{$_("ML_ACTUAL")}</th>
			{#each MLState.classes as classData}
				<th>{classData.name}</th>
			{/each}
		</tr>
		</thead>
		<tbody>
		{#each MLState.confusion as row, rowIndex}
			<tr>
				<th>{MLState.classes[rowIndex].name}</th>
				{#each row as value, valueIndex}
					<td
						class="matrix-value"
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

	<Button onclick={upload} large bold mode="primary" icon={faUsb} name={$_("UPLOAD")} />
</div>

<style>
	h1 {
		margin: 0;
	}

	.content-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 30px;
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin: 20px 0;
		font-family: sans-serif;
	}

	th, td {
		border: 1px solid #ccc;
		padding: 8px 12px;
		text-align: center;
	}

	th {
		background-color: #f2f2f2;
		font-weight: bold;
	}

	.header-label {
		font-weight: bold;
		background-color: #e0e0e0;
	}

	.actual-label {
		font-weight: bold;
		background-color: #e0e0e0;
		white-space: nowrap;
	}

	.matrix-value {
		position: relative;
		z-index: 1;
	}

	.matrix-value:before {
		content: "";
		position: absolute;
		inset: 0;
		z-index: -1;

		background-color: var(--bg-color);
		opacity: var(--bg-opacity);
	}
</style>
