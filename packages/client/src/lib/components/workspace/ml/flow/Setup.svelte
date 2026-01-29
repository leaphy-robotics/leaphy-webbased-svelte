<script lang="ts">
import AddSensor from "$components/core/popups/popups/AddSensor.svelte";
import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Warning from "$components/core/popups/popups/Warning.svelte";
import Button from "$components/ui/Button.svelte";
import MLState from "$state/ml.svelte";
import PopupState from "$state/popup.svelte";
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ml } from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";

async function upload() {
	if (MLState.sensors.length === 0) {
		return PopupState.open({
			component: ErrorPopup,
			data: {
				title: "ML_NO_SENSORS_TITLE",
				message: "ML_NO_SENSORS_DESCRIPTION",
			},
			allowInteraction: false,
		});
	}

	await MLState.upload();
	if (ml.maxStep === 0) ml.maxStep = 1;
}

async function addSensor() {
	if (ml.datasets.getItems().length > 0) {
		const confirmed = (await PopupState.open({
			component: Warning,
			data: {
				title: "ML_CLEAR_DATASETS",
			},
			allowInteraction: false,
		})) as boolean;
		if (!confirmed) return;

		ml.datasets.clear();
	}

	await PopupState.open({
		component: AddSensor,
		data: {},
		allowInteraction: false,
		allowOverflow: true,
	});
}

function deleteSensor(id: string) {
	ml.sensors.deleteItem(id);
	ml.maxStep = 0;
}
</script>

<div class="content-area">
	<div class="header">
		<h1>{$_("ML_PREPARE_TITLE")}</h1>
		<span>{$_("ML_PREPARE_DESC")}</span>
	</div>

	<div class="sensors">
		{#if MLState.sensors.length === 0}
			<div class="sensor">
				<div class="name">{$_("ML_NO_SENSORS")}</div>
			</div>
		{/if}
		{#each MLState.sensors as sensor}
			<div class="sensor">
				<div class="name">
					{sensor.type.renderName(sensor.settings)}
				</div>
				<button onclick={() => deleteSensor(sensor.id)} class="delete"><Fa icon={faXmark} /></button>
			</div>
		{/each}

		<button class="add" onclick={addSensor}><Fa icon={faPlus} /> {$_("ML_ADD_SENSOR")}</button>
	</div>
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

	.sensors {
		display: flex;
		flex-direction: column;
		background: var(--secondary);
		width: 100%;
		border-radius: 20px;
		overflow: hidden;
	}

	.sensor {
		position: relative;
		display: flex;
		justify-content: space-between;
		border-bottom: 2px solid #00000025;
		text-align: left;
	}

	.name {
		padding: 15px;
	}

	.sensor:last-of-type {
		border-bottom: none;
	}

	.add {
		display: flex;
		justify-content: center;
		align-items: center;

		gap: 5px;
		border: none;
		outline: 0;
		background: var(--primary);
		color: var(--on-primary);
		font-weight: bold;
		padding: 15px;
		cursor: pointer;
		font-size: 1em;
	}

	.delete {
		background: none;
		border: none;
		outline: 0;
		color: salmon;
		font-size: 1.3em;
		aspect-ratio: 1/1;

		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;

		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
