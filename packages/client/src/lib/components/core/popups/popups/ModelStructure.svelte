<script lang="ts">
import Button from "$components/ui/Button.svelte";
import ModelVisualizer from "$components/workspace/ml/ModelVisualizer.svelte";
import { loadToolbox } from "$domain/blockly/blockly";
import { dark, light } from "$domain/blockly/theme";
import AppState, { Theme } from "$state/app.svelte";
import BlocklyState from "$state/blockly.svelte";
import MLState from "$state/ml.svelte";
import type { PopupState } from "$state/popup.svelte";
import WorkspaceState from "$state/workspace.svelte";
import {
	type ModelLayer,
	ml,
} from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import * as Blockly from "blockly";
import type { Block, Workspace } from "blockly";
import type { CategoryInfo } from "blockly/core/utils/toolbox";
import { getContext, onMount } from "svelte";
import { _ } from "svelte-i18n";

let layerStructure = $derived([
	MLState.sensors.length,
	...MLState.structure.map((layer) => layer.units),
	MLState.classes.length,
]);

function getTheme(theme: Theme) {
	return theme === Theme.DARK ? dark : light;
}

function convertStructureToBlocks() {
	const blockStructure = MLState.structure.reduceRight((prev, curr) => {
		return {
			block: {
				type: "ml_layer",
				id: Blockly.utils.idGenerator.genUid(),
				fields: {
					UNITS: curr.units,
				},
				next: prev,
			},
		};
	}, null as any);

	return {
		blocks: {
			languageVersion: 0,
			blocks: [
				{
					type: "ml_model",
					id: Blockly.utils.idGenerator.genUid(),
					x: 48,
					y: -311,
					deletable: false,
					inputs: {
						STACK: blockStructure,
					},
				},
			],
		},
	};
}

function storeModelStructure(workspace: Workspace) {
	const structure: ModelLayer[] = [];
	const [model] = workspace.getBlocksByType("ml_model");

	let layer: Block = model.getChildren(true)[0];
	while (layer) {
		structure.push({
			activation: "relu",
			units: layer.getFieldValue("UNITS"),
		});
		layer = layer.getNextBlock();
	}

	ml.structure = structure;
}

let editor = $state<HTMLDivElement>();
onMount(() => {
	const workspace = Blockly.inject(editor, {
		renderer: "zelos",
		media: "blockly-assets",
		toolbox: {
			kind: "categoryToolbox",
			contents: [
				{
					kind: "category",
					name: "Machine Learning",
					categorystyle: "ml_category",
					toolboxitemid: "l_ml",
					contents: [
						{
							kind: "block",
							type: "ml_layer",
						},
					],
				} as unknown as CategoryInfo,
			],
		},
		theme: getTheme(AppState.theme),
		zoom: {
			controls: true,
			startScale: 0.8,
		},
	});

	const toolbox = workspace.getToolbox();
	toolbox.getFlyout().autoClose = false;
	toolbox.selectItemByPosition(0);
	toolbox.refreshTheme();

	ml.freeze = true; // Ensures Blockly doesn't decide to clear ML state
	Blockly.serialization.workspaces.load(convertStructureToBlocks(), workspace);
	ml.freeze = false;

	workspace.addChangeListener(Blockly.Events.disableOrphans);
	workspace.addChangeListener(() => storeModelStructure(workspace));

	console.log(() => Blockly.serialization.workspaces.save(workspace));
});

const popupState = getContext<PopupState>("state");
function close() {
	popupState.close();
}
</script>

<div class="content">
	<div class="items">
		<div bind:this={editor} class="editor"></div>
		<ModelVisualizer layers={layerStructure} />
	</div>

	<Button name={$_("DONE")} mode={"accent"} onclick={close} bold={true} />
</div>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 1200px;
		height: 800px;
		padding: 20px;
		gap: 20px;
		text-align: center;
		background: var(--background-tint);
	}

	.items {
		display: flex;
		width: 100%;
		flex: 1;
	}

	.editor {
		flex: 1;
		border-radius: 15px;
		height: 100%;
	}
</style>
