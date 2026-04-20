<script lang="ts">
import { _ } from "svelte-i18n";
import ModelStructure from "$components/core/popups/popups/ModelStructure.svelte";
import Progress from "$components/core/popups/popups/Progress.svelte";
import Button from "$components/ui/Button.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import DistributionGraph from "$components/workspace/ml/DistributionGraph.svelte";
import MLState from "$state/ml.svelte";
import PopupState from "$state/popup.svelte";

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

<div class="flex flex-col items-center justify-center gap-8">
	<div class="flex flex-col gap-5">
		<h1 class="m-0">{$_("ML_TRAIN_TITLE")}</h1>
		<span>{$_("ML_TRAIN_DESC")}</span>
	</div>

	<div class="flex flex-col gap-2.5 w-full text-left">
		<div class="font-bold">{$_("ML_EPOCHS")}</div>
		<TextInput placeholder={"100"} bind:value={MLState.epochs} large type="number" mode="secondary" required rounded={true} />
	</div>

	<div class="flex flex-col gap-2.5 bg-secondary rounded-2xl px-10 py-5 overflow-hidden w-full items-center">
		<h2>{$_("ML_DISTRIBUTION")}</h2>
		<div class="grid grid-cols-2 gap-12">
			<div>
				<DistributionGraph data={MLState.classes.map((classData, index) => ({ name: classData.name, value: Number.parseInt(MLState.distribution[index]) }))} />
			</div>
			<div class="flex flex-col gap-2.5 justify-center">
				{#each MLState.classes as classData, index}
					<div class="flex flex-col gap-2.5 w-full text-left">
						<div class="font-bold">{classData.name} ({MLState.available[index]} {$_("ML_TOTAL")})</div>
						<TextInput placeholder={"50"} bind:value={MLState.distribution[index]} large type="number" mode="background" required rounded={true} />
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="flex gap-5">
		<Button onclick={editModel} mode="secondary" name={$_("ML_ADVANCED_EDIT_MODEL")} />
		<Button onclick={train} large bold mode="primary" name={$_("ML_TRAIN")} />
	</div>
</div>
