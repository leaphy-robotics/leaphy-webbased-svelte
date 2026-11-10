<script lang="ts">
import { PinSelectorField } from "@leaphy-robotics/leaphy-blocks";
import { ml } from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import {
	type Sensor,
	type SensorGroup,
	sensors,
} from "@leaphy-robotics/leaphy-blocks/src/categories/ml/sensors";
import { getContext } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import Button from "$components/ui/Button.svelte";
import Field from "$components/ui/Field.svelte";
import Select from "$components/ui/Select.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import {
	sensorGroupIcons,
	sensorGroupNames,
} from "$components/workspace/ml/sensorIcons";
import MLState from "$state/ml.svelte";
import type { PopupState } from "$state/popup.svelte";

const popupState = getContext<PopupState>("state");

const groups = (["spark", "pins", "i2c"] as SensorGroup[]).map((group) => ({
	group,
	sensors: sensors.filter((sensor) => sensor.group === group),
}));

let sensor = $state<Sensor>(sensors[0]);
const parsedSensor = $derived.by(() => {
	const parsed = structuredClone(sensor);
	parsed.settings = parsed.settings.map((setting) => {
		if (setting.type === "pin") {
			return {
				...setting,
				type: "select",
				options: PinSelectorField.getOptions(
					setting.pinType as "digital" | "analog" | "pwm",
				),
			};
		}

		return setting;
	});

	return parsed;
});

function createSettings(sensor: Sensor) {
	const settings: Record<string, unknown> = {};
	sensor.settings.forEach((setting) => {
		switch (setting.type) {
			case "select": {
				settings[setting.id] = setting.default || setting.options[0][1];
				break;
			}
			case "text": {
				settings[setting.id] = "";
				break;
			}
		}
	});

	return settings;
}

let settings = $state({});
$effect(() => {
	settings = createSettings(parsedSensor);
});

function cancel() {
	popupState.close();
}

function addSensor() {
	ml.sensors.createItem({
		type: sensor,
		settings,
	});
	popupState.close();
	ml.maxStep = 0;
	MLState.collectorUpload = "idle";
}
</script>

<div class="flex max-h-[85vh] w-[640px] max-w-[90vw] flex-col gap-6 overflow-auto p-5 text-center">
	<div class="flex flex-col gap-1">
		<h1 class="m-0">{$_("ML_ADD_SENSOR_TITLE")}</h1>
		<div class="text-on-secondary-muted">{$_("ML_ADD_SENSOR_DESC")}</div>
	</div>

	{#each groups as { group, sensors: groupSensors }}
		<section class="flex flex-col gap-2 text-left">
			<h2 class="m-0 flex items-center gap-2 text-base!"><Fa icon={sensorGroupIcons[group]} /> {$_(sensorGroupNames[group])}</h2>
			<div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label={$_(sensorGroupNames[group])}>
				{#each groupSensors as option}
					<button
						type="button"
						role="radio"
						aria-checked={sensor === option}
						onclick={() => sensor = option}
						class="flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-3 text-left text-on-bg
							{sensor === option ? 'border-primary bg-primary/10' : 'border-secondary bg-bg'}"
					>
						<span class="font-bold">{$_(option.name)}</span>
						<span class="text-sm text-on-secondary-muted">{$_(option.description)}</span>
					</button>
				{/each}
			</div>
		</section>
	{/each}

	{#each parsedSensor.settings as setting}
		<Field label={$_(setting.name)} hint={setting.description ? $_(setting.description) : undefined}>
			{#if setting.type === 'select'}
				<Select mode="secondary" full options={setting.options} bind:value={settings[setting.id]} align="left" />
			{:else if setting.type === 'text'}
				<TextInput mode="secondary" rounded bind:value={settings[setting.id]} />
			{/if}
		</Field>
	{/each}

	<div class="flex justify-center gap-2.5">
		<Button onclick={cancel} mode="secondary" name={$_("CANCEL")} large center />
		<Button onclick={addSensor} mode="primary" name={$_("ML_ADD_SENSOR")} large center bold />
	</div>
</div>
