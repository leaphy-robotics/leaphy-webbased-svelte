<script lang="ts">
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import {
	faPlus,
	faRotateRight,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { ml } from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import AddSensor from "$components/core/popups/popups/AddSensor.svelte";
import Warning from "$components/core/popups/popups/Warning.svelte";
import Button from "$components/ui/Button.svelte";
import StatusBanner from "$components/ui/StatusBanner.svelte";
import StepIntro from "$components/workspace/ml/StepIntro.svelte";
import { sensorGroupIcons } from "$components/workspace/ml/sensorIcons";
import MLState from "$state/ml.svelte";
import PopupState from "$state/popup.svelte";

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
	MLState.collectorUpload = "idle";
}
</script>

<div class="flex flex-col gap-5">
	<StepIntro title={$_("ML_PREPARE_TITLE")} description={$_("ML_PREPARE_DESC")} />

	<section class="flex flex-col gap-3 text-left">
		<h2 class="m-0 text-base!">{$_("ML_YOUR_SENSORS")}</h2>
		{#if MLState.sensors.length === 0}
			<div class="rounded-2xl border-2 border-dashed border-secondary p-4 text-center text-on-secondary-muted">
				<div class="font-bold">{$_("ML_NO_SENSORS")}</div>
				<div class="text-sm">{$_("ML_NO_SENSORS_HINT")}</div>
			</div>
		{:else}
			<div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
				{#each MLState.sensors as sensor (sensor.id)}
					{@const name = sensor.type.renderName(sensor.settings)}
					<div class="flex items-start gap-3 rounded-2xl bg-bg-tint p-3">
						<span class="mt-0.5 text-xl text-accent"><Fa icon={sensorGroupIcons[sensor.type.group]} /></span>
						<div class="flex min-w-0 flex-1 flex-col gap-1">
							<div class="font-bold">{$_(name.translation, { values: name.values })}</div>
							<div class="text-sm text-on-secondary-muted">{$_(sensor.type.description)}</div>
						</div>
						<button
							onclick={() => deleteSensor(sensor.id)}
							class="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border-none bg-transparent text-danger hover:bg-secondary"
							aria-label={$_("ML_REMOVE_SENSOR", { values: { name: $_(name.translation, { values: name.values }) } })}
						><Fa icon={faXmark} /></button>
					</div>
				{/each}
			</div>
		{/if}
		<div><Button onclick={addSensor} mode="secondary" icon={faPlus} name={$_("ML_ADD_SENSOR")} /></div>
	</section>

	<section class="flex flex-col gap-3 text-left">
		<h2 class="m-0 text-base!">{$_("ML_UPLOAD_COLLECTOR_TITLE")}</h2>
		{#if MLState.collectorUpload === "uploading"}
			<StatusBanner kind="loading" title={$_("ML_UPLOADING")} message={$_("ML_UPLOADING_DESC")} />
		{:else if MLState.collectorUpload === "error"}
			<StatusBanner kind="error" title={$_("ML_UPLOAD_FAILED")} message={$_("ML_UPLOAD_FAILED_DESC")}>
				{#snippet actions()}
					<Button onclick={() => MLState.uploadCollector()} mode="secondary" icon={faRotateRight} name={$_("TRY_AGAIN")} />
				{/snippet}
			</StatusBanner>
		{:else if MLState.collectorUploaded}
			<StatusBanner kind="success" title={$_("ML_COLLECTOR_UPLOADED")} message={$_("ML_COLLECTOR_UPLOADED_DESC")}>
				{#snippet actions()}
					<Button onclick={() => MLState.uploadCollector()} mode="secondary" icon={faUsb} name={$_("ML_UPLOAD_AGAIN")} />
				{/snippet}
			</StatusBanner>
		{:else if !MLState.hasSensors}
			<StatusBanner kind="info" title={$_("ML_ADD_SENSOR_FIRST")} message={$_("ML_UPLOAD_COLLECTOR_DESC")} />
		{:else}
			<StatusBanner kind="info" title={$_("ML_READY_TO_UPLOAD")} message={$_("ML_UPLOAD_COLLECTOR_DESC")}>
				{#snippet actions()}
					<Button onclick={() => MLState.uploadCollector()} mode="accent" bold icon={faUsb} name={$_("UPLOAD")} />
				{/snippet}
			</StatusBanner>
		{/if}
	</section>
</div>
