<script lang="ts">
import Button from "$components/ui/Button.svelte";
import Switch from "$components/ui/Switch.svelte";
import AssignKey from "$components/workspace/ml/AssignKey.svelte";
import RobotStatus from "$components/workspace/ml/RobotStatus.svelte";
import MLState from "$state/ml.svelte";
import { faBluetooth } from "@fortawesome/free-brands-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { ml } from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
</script>

<div class="content-area">
	{#if !MLState.connected}
		<div class="bluetooth">
			<div class="left">
				<div class="title">{$_("ML_NOT_CONNECTED")}</div>
				<div class="desc">{$_("ML_NOT_CONNECTED_DESC")}</div>
			</div>
			<Button mode="accent" name={$_("ML_CONNECT")} icon={faBluetooth} onclick={() => MLState.connect()} />
		</div>
	{/if}

	<div class="content" class:disconnected={!MLState.connected}>
		<div class="container">
			<RobotStatus />
			<div class="collect">
				<div class="header">
					<h1>{$_("ML_COLLECT_TITLE")}</h1>
					<span>{$_("ML_COLLECT_DESC")}</span>
				</div>

				<div class="list">
					{#each MLState.classes as classData (classData.id)}
						<div class="item">
							<div class="name">{classData.name}</div>
							<AssignKey {classData} />
						</div>
					{/each}
				</div>

				<div class="list">
					<div class="item">
						<div class="left">
							<div class="name">{MLState.learning ? MLState.classification ? $_("ML_RECORDING_FOR", { values: { target: ml.classes.getItem(MLState.classification).name } }) : $_("ML_RECORDING") : $_("ML_RECORD")}</div>
							<Switch name={$_("ML_MANUAL")} bind:checked={MLState.manual} />
						</div>
						<button onclick={() => MLState.learn()} class="record" class:recording={MLState.learning} aria-label="record"></button>
					</div>

					{#each MLState.datasets.toReversed() as dataset (dataset.id)}
						<div class="item">
							<div class="dataset">Dataset {dataset.date.toLocaleString()}</div>
							<button onclick={() => ml.datasets.deleteItem(dataset.id)} class="delete"><Fa icon={faTrash} /></button>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

</div>

<style>
	.bluetooth {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--primary);
		color: var(--on-primary);
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		padding: 20px 40px;
		text-align: left;
	}

	.title {
		font-weight: bold;
		font-size: 1.2em;
	}

	.disconnected {
		padding-top: 60px;
		opacity: 0.4;
		pointer-events: none;
	}

	h1 {
		margin: 0;
	}

	.left {
		display: flex;
		flex-direction: column;
		text-align: left;
		gap: 10px;
	}

	.container {
		display: flex;
		gap: 40px;
	}

	.collect {
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

	.list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: var(--secondary);
		border-radius: 20px;
		overflow: hidden;
		width: 100%;
	}

	.item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 2px solid #00000025;
		padding: 10px 20px;
	}

	.item:first-child {
		padding-top: 15px;
	}
	.item:last-child {
		padding-bottom: 15px;
		border-bottom: none;
	}

	.name {
		font-weight: bold;
	}

	.record {
		--size: 40px;

		position: relative;
		border: none;
		background: var(--background);
		border-radius: 100%;

		width: var(--size);
		height: var(--size);
		cursor: pointer;
	}

	.record:before {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		width: calc(var(--size) - 6px);
		height: calc(var(--size) - 6px);

		border-radius: 50%;
		background: salmon;
		transition: 0.2s ease;
	}

	.record.recording:before {
		width: calc(var(--size) / 2);
		height: calc(var(--size) / 2);
		border-radius: 5px;
	}

	.delete {
		background: none;
		border: none;
		outline: 0;
		color: salmon;
		font-size: 1.3em;
		aspect-ratio: 1/1;

		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
