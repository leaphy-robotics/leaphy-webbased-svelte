<script lang="ts">
	import {Sensor, sensors} from "@leaphy-robotics/leaphy-blocks/src/categories/ml/sensors";
	import Select from "$components/ui/Select.svelte";
	import TextInput from "$components/ui/TextInput.svelte";
	import Button from "$components/ui/Button.svelte";
	import MLState from "$state/ml.svelte"
	import {getContext} from "svelte";
	import type {PopupState} from "$state/popup.svelte";
	import {ml} from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
	import PinSelectorField from "$domain/blockly/fields";

	const popupState = getContext<PopupState>("state");
	const sensorOptions = sensors.map(sensor => ([sensor.name, sensor]) as [string, Sensor])

	let sensor = $state<Sensor>(sensorOptions[0][1])
	const parsedSensor = $derived.by(() => {
		const parsed = structuredClone(sensor)
		parsed.settings = parsed.settings.map(setting => {
			if (setting.type === 'pin') {
				return {
					...setting,
					type: 'select',
					options: PinSelectorField.getOptions(setting.pinType)
				}
			}

			return setting
		})

		return parsed;
	})

	function createSettings(sensor: Sensor) {
		const settings: Record<string, unknown> = {}
		sensor.settings.forEach(setting => {
			switch (setting.type) {
				case 'select': {
					settings[setting.id] = setting.default || setting.options[0][1]
					break
				}
				case 'text': {
					settings[setting.id] = ''
					break
				}
			}
		})

		return settings
	}

	let settings = $state({})
	$effect(() => {
		settings = createSettings(parsedSensor)
	})

	function cancel() {
		popupState.close()
	}

	function addSensor() {
		ml.addSensor({
			type: sensor,
			settings
		})
		popupState.close()
	}
</script>

<div class="content">
	<h1>Add a sensor</h1>

	<div class="input-group">
		<div class="label">Sensor type</div>
		<Select mode="secondary" full options={sensorOptions} bind:value={sensor} />
	</div>

	{#each parsedSensor.settings as setting}
		<div class="input-group">
			<div class="desc">
				<div class="label">{setting.name}</div>
				<div class="description">{setting.description}</div>
			</div>

			{#if setting.type === 'select'}
				<Select mode="secondary" full options={setting.options} bind:value={settings[setting.id]} />
			{:else if setting.type === 'text'}
				<TextInput mode="secondary" rounded bind:value={settings[setting.id]} />
			{/if}
		</div>
	{/each}

	<div class="buttons">
		<Button onclick={cancel} mode="secondary" name="Cancel" large center />
		<Button onclick={addSensor} mode="primary" name="Add sensor" large center bold />
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
