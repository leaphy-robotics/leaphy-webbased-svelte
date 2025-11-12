import robotGroups from "$domain/robots.groups";
import {getMainWorkspace, type WorkspaceSvg} from "blockly";
import type LeaphyToolbox from "$domain/blockly/category-ui/toolbox.svelte";
import * as Blockly from "blockly";
import type {ISerializer} from "blockly/core/interfaces/i_serializer";
import { RobotType } from "$domain/robots.types";
import BlocklyState from "$state/blockly.svelte";
import type { ToolboxCategory } from "blockly";

export const extensions = [
	{
		name: "LISTS_CATEGORY",
		description: "LISTS_CATEGORY_DESCRIPTION",
		style: "lists_category",
		id: "l_lists",
		boards: robotGroups.L_ARDUINO_ALL,
	},
	{
		name: "OPERATORS_CATEGORY",
		description: "OPERATORS_CATEGORY_DESCRIPTION",
		style: "numbers_category",
		id: "l_operators",
		inactiveId: "l_numbers",
		boards: robotGroups.L_ARDUINO_ALL,
	},
	{
		name: "ML_CATEGORY",
		description: "ML_CATEGORY_DESCRIPTION",
		style: "ml_category",
		id: "l_ml",
		boards: [RobotType.L_NANO_ESP32],
	},
	{
		name: "MESH_CATEGORY",
		description: "MESH_CATEGORY_DESCRIPTION",
		style: "mesh_category",
		id: "l_mesh",
		boards: [RobotType.L_NANO_ESP32],
	},
	{
		name: "BLE_CATEGORY",
		description: "BLE_CATEGORY_DESCRIPTION",
		style: "ble_category",
		id: "l_ble",
		boards: [RobotType.L_NANO_ESP32],
	},
]

function getBlocksInCategory(category: ToolboxCategory) {
	let contents = category.getContents();
	if (typeof contents === "string") {
		const callback = BlocklyState.workspace.getToolboxCategoryCallback(contents);
		if (!callback) return;

		const customContents = callback(BlocklyState.workspace);
		if (!Array.isArray(customContents)) return;

		contents = customContents as Blockly.utils.toolbox.FlyoutItemInfoArray;
	}

	return contents.filter(e => e.kind === "block" && "type" in e).map(e => (e as Blockly.utils.toolbox.BlockInfo).type);
}

class Extensions implements ISerializer {
	enabled = $state<string[]>([])

	priority: number = 100;

	save(): object | null {
		return { enabled: this.enabled };
	}

	load(state: object): void {
		if ("enabled" in state && Array.isArray(state.enabled)) this.enabled = state.enabled
	}

	clear(): void {
		this.enabled = []
	}

	isEnabled(extension: string) {
		const inactiveExtension = extensions.find(e => e.inactiveId === extension);
		if (inactiveExtension) {
			return !this.isEnabled(inactiveExtension.id);
		}

		if (this.enabled.includes(extension)) {
			return true
		}

		return !extensions.find(e => e.id === extension)
	}

	selectCategory(category: string) {
		const toolbox = (getMainWorkspace() as WorkspaceSvg).getToolbox() as LeaphyToolbox
		const item = toolbox.getToolboxItems().findIndex((e) => e.getId() === category)
		toolbox.selectItemByPosition(item)
	}

	toggle(id: string) {
		const toolbox = (getMainWorkspace() as WorkspaceSvg).getToolbox() as LeaphyToolbox
 		const extension = extensions.find(e => e.id === id)

		if (!this.enabled.includes(id)) {
			this.enabled.push(id);
			this.selectCategory(id);
			return
		}

		const categories = Array.from(
			// biome-ignore lint/complexity/useLiteralKeys: protected properties must be accessed using brackets
			toolbox["contents"].values(),
		) as ToolboxCategory[];

		const categoryBlocks = categories.map(category => ({
			category: category.getId(),
			blocks: getBlocksInCategory(category),
		}))

		const blocks = categoryBlocks.find(e => e.category === id)?.blocks;
		blocks?.forEach(block => {
			// check if the block is in another category (for example: numbers and operators have several overlapping blocks)
			if (categoryBlocks.find(e => e.category !== id && e.blocks.includes(block))) {
				return;
			}

			BlocklyState.workspace.getBlocksByType(block).forEach(block => {
				block.dispose(true);
			})
		})

		this.enabled.splice(this.enabled.indexOf(id), 1)
		if (extension.inactiveId) {
			this.selectCategory(extension.inactiveId)
		} else if (toolbox.getSelectedItem().getId() === id) {
			toolbox.selectItemByPosition(1)
		}
	}
}

export default new Extensions();
