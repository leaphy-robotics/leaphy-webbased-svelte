<script lang="ts">
import ModelStructure from "$components/core/popups/popups/ModelStructure.svelte";
import Progress from "$components/core/popups/popups/Progress.svelte";
import Button from "$components/ui/Button.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import DistributionGraph from "$components/workspace/ml/DistributionGraph.svelte";
import MLState from "$state/ml.svelte";
import PopupState from "$state/popup.svelte";
import { _ } from "svelte-i18n";

function train() {
	PopupState.open({
		component: Progress,
		data: {
			generator: MLState.train(),
		},
		allowInteraction: false,
	});
}

function editModel() {
	PopupState.open({
		component: ModelStructure,
		data: {},
		allowInteraction: false,
	});
}
</script>

<div class="content-area">
	<div class="header">
		<h1>{$_("ML_TRAIN_TITLE")}</h1>
		<span>{$_("ML_TRAIN_DESC")}</span>
	</div>

	<div class="input">
		<div class="label">{$_("ML_EPOCHS")}</div>
		<TextInput
			placeholder={"100"}
			bind:value={MLState.epochs}
			large
			type="number"
			mode="secondary"
			required
			rounded={true}>
		</TextInput>
	</div>

	<div class="distribution">
		<h2>{$_("ML_DISTRIBUTION")}</h2>

		<div class="content">
			<div class="left">
				<DistributionGraph data={MLState.classes.map((classData, index) => ({ name: classData.name, value: Number.parseInt(MLState.distribution[index]) }))} />
			</div>
			<div class="right">
				{#each MLState.classes as classData, index}
					<div class="input">
						<div class="label">{classData.name} ({MLState.available[index]} {$_("ML_TOTAL")})</div>
						<TextInput
							placeholder={"50"}
							bind:value={MLState.distribution[index]}
							large
							type="number"
							mode="background"
							required
							rounded={true}>
						</TextInput>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="buttons">
		<Button onclick={editModel} mode="secondary" name={$_("ML_ADVANCED_EDIT_MODEL")} />
		<Button onclick={train} large bold mode="primary" name={$_("ML_TRAIN")} />
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

	.input {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		text-align: left;
	}

	.label {
		font-weight: bold;
	}

	.distribution {
		display: flex;
		flex-direction: column;
		gap: 10px;
		background: var(--secondary);
		border-radius: 20px;
		padding: 20px 40px;
		overflow: hidden;
		width: 100%;
		align-items: center;
	}

	.right {
		display: flex;
		flex-direction: column;
		gap: 10px;
		justify-content: center;
	}

	.content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 50px;
	}

	.buttons {
		display: flex;
		gap: 20px;
	}
</style>
