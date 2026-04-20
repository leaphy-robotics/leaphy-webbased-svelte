<script lang="ts">
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ml } from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import AddSensor from "$components/core/popups/popups/AddSensor.svelte";
import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Warning from "$components/core/popups/popups/Warning.svelte";
import Button from "$components/ui/Button.svelte";
import MLState from "$state/ml.svelte";
import PopupState from "$state/popup.svelte";

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

<div class="flex flex-col items-center justify-center gap-8">
	<div class="flex flex-col gap-5">
		<h1 class="m-0">{$_("ML_PREPARE_TITLE")}</h1>
		<span>{$_("ML_PREPARE_DESC")}</span>
	</div>

	<div class="flex flex-col bg-secondary w-full rounded-2xl overflow-hidden">
		{#if MLState.sensors.length === 0}
			<div class="relative flex justify-between border-b-2 border-black/15 last:border-b-0 text-left">
				<div class="p-4">{$_("ML_NO_SENSORS")}</div>
			</div>
		{/if}
		{#each MLState.sensors as sensor}
			{@const name = sensor.type.renderName(sensor.settings)}
			<div class="relative flex justify-between border-b-2 border-black/15 last:border-b-0 text-left">
				<div class="p-4">{$_(name.translation, { values: name.values })}</div>
				<button onclick={() => deleteSensor(sensor.id)} class="bg-transparent border-none outline-none text-[salmon] text-xl aspect-square absolute top-0 right-0 bottom-0 flex items-center justify-center cursor-pointer"><Fa icon={faXmark} /></button>
			</div>
		{/each}

		<button class="flex justify-center items-center gap-1.5 border-none outline-none bg-primary text-on-primary font-bold p-4 cursor-pointer text-base" onclick={addSensor}><Fa icon={faPlus} /> {$_("ML_ADD_SENSOR")}</button>
	</div>
	<Button onclick={upload} large bold mode="primary" icon={faUsb} name={$_("UPLOAD")} />
</div>
