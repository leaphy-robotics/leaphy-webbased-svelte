<script lang="ts">
import Button from "$components/ui/Button.svelte";
import Select from "$components/ui/Select.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import PinSelectorField from "$domain/blockly/fields";
import MLState from "$state/ml.svelte";
import type { PopupState } from "$state/popup.svelte";
import { ml } from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import {
	type Sensor,
	sensors,
} from "@leaphy-robotics/leaphy-blocks/src/categories/ml/sensors";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";

const popupState = getContext<PopupState>("state");
const sensorOptions = sensors.map(
	(sensor) => [$_(sensor.name), sensor] as [string, Sensor],
);

let sensor = $state<Sensor>(sensorOptions[0][1]);
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
}
</script>

<div class="content">
	<h1>{$_("ML_ADD_SENSOR_TITLE")}</h1>

	<div class="input-group">
		<div class="label">{$_("ML_SENSOR_TYPE")}</div>
		<Select mode="secondary" full options={sensorOptions} bind:value={sensor} align="left" />
	</div>

	{#each parsedSensor.settings as setting}
		<div class="input-group">
			<div class="desc">
				<div class="label">{$_(setting.name)}</div>
				<div class="description">{$_(setting.description)}</div>
			</div>

			{#if setting.type === 'select'}
				<Select mode="secondary" full options={setting.options} bind:value={settings[setting.id]} align="left" />
			{:else if setting.type === 'text'}
				<TextInput mode="secondary" rounded bind:value={settings[setting.id]} />
			{/if}
		</div>
	{/each}

	<div class="buttons">
		<Button onclick={cancel} mode="secondary" name={$_("CANCEL")} large center />
		<Button onclick={addSensor} mode="primary" name={$_("ML_ADD_SENSOR")} large center bold />
	</div>
</div>

<style>
	.content {
		display: flex;
		flex-direction: column;
		width: 500px;
		padding: 20px;
		text-align: center;
		gap: 30px;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 5px;
		text-align: left;
	}

	.label {
		font-weight: bold;
	}

	.desc {
		display: flex;
		flex-direction: column;
	}

	.buttons {
		display: flex;
		justify-content: center;
		gap: 10px;
	}
</style>
