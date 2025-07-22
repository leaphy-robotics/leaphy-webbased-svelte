<script lang="ts">
	import {faBluetooth, faUsb} from "@fortawesome/free-brands-svg-icons";
	import Button from "$components/ui/Button.svelte";
	import MLState from "$state/ml.svelte"
	import Uploader from "$components/core/popups/popups/Uploader.svelte";
	import WorkspaceState from "$state/workspace.svelte";
	import PopupState from "$state/popup.svelte";
	import AddSensor from "$components/core/popups/popups/AddSensor.svelte";
	import Fa from "svelte-fa";
	import {faPlus, faXmark} from "@fortawesome/free-solid-svg-icons";
	import {ml} from "@leaphy-robotics/leaphy-blocks/src/categories/ml";

	function upload() {
		PopupState.open({
			component: Uploader,
			data: {
				source: WorkspaceState.code,
			},
			allowInteraction: false,
		});
	}

	function addSensor() {
		PopupState.open({
			component: AddSensor,
			data: {},
			allowInteraction: false,
			allowOverflow: true,
		})
	}

	function deleteSensor(id: string) {
		ml.deleteSensor(id)
	}
</script>

<div class="content-area">
	<div class="header">
		<h1>Prepare your robot</h1>
		<span>Set up your sensors and upload the training program to the robot, you can then connect to the robot using Bluetooth</span>
	</div>

	<div class="sensors">
		{#if MLState.sensors.length === 0}
			<div class="sensor">
				<div class="name">No sensors have been added yet</div>
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

		<button class="add" onclick={addSensor}><Fa icon={faPlus} /> Add Sensor</button>
	</div>
	<div class="btn">
		<Button onclick={upload} large bold mode="primary" icon={faUsb} name="Upload" />
		<Button onclick={() => MLState.connect()} large bold mode="secondary" icon={faBluetooth} name="Connect" />
	</div>
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

	.btn {
		display: flex;
		gap: 10px;
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
