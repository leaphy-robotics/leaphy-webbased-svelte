import type { utils } from "blockly";
import {
	BlockSvg,
	getMainWorkspace,
	Msg,
	type WorkspaceSvg,
} from "blockly/core";
import type { BlockDefinition } from "blockly/core/blocks";
import Extensions from "$domain/blockly/extensions.svelte";
import { serializeBlock } from "$domain/blockly/pseudo";
import toolbox from "$domain/blockly/toolbox";
import { inFilter } from "$domain/robots";
import BlocklyState from "$state/blockly.svelte";
import WorkspaceState from "$state/workspace.svelte";

export function getAllBlocks() {
	const contents = toolbox
		.filter((category) => category.id !== "l_search")
		.filter(({ robots }) =>
			robots ? inFilter(WorkspaceState.robot, robots) : true,
		)
		.filter((category) => Extensions.isEnabled(category.id))
		.flatMap((category) => {
			if (category.custom) {
				const callback = BlocklyState.workspace.getToolboxCategoryCallback(
					category.custom,
				);
				if (!callback) return null;

				return callback(
					BlocklyState.workspace,
				) as utils.toolbox.FlyoutItemInfoArray;
			}
			if (!category.groups) return null;
			return category.groups.flatMap((group) =>
				group.blocks.map((block) => ({
					kind: "block",
					...block,
				})),
			);
		})
		.filter((block) => block.kind === "block" && "type" in block);

	// Add blocks to a map to avoid duplicates
	const blocks = new Map<string, BlockDefinition>();
	for (const block of contents) {
		blocks.set(block.type, block);
	}

	return Array.from(blocks.values());
}

const input = document.createElement("input");
input.type = "text";

input.placeholder = "🔎 Start typing to search...";
input.style.position = "fixed";
input.style.left = "80px";
input.style.top = "65px";
input.style.zIndex = "20";
input.classList.add("search-input");
Object.assign(input.style, {
	position: "fixed",
	left: "80px",
	top: "65px",
	zIndex: "20",
	margin: "10px",
	padding: "8px",
	background: "var(--secondary)",
	border: "none",
	outline: "0",
	borderRadius: "50px",
});
document.body.appendChild(input);

input.addEventListener("input", () => {
	(getMainWorkspace() as WorkspaceSvg).getToolbox()?.refreshSelection();
});

export default function (workspace: WorkspaceSvg) {
	let blockList = [
		{
			kind: "label",
			"web-class": "search-input-label",
			text: new Array(64).fill(" ").join(""),
		},
		{
			kind: "sep",
			gap: 60,
		},
	];

	if (input.value) {
		const blocks = getAllBlocks();
		blocks.forEach((blockDef) => {
			const block = new BlockSvg(workspace, blockDef.type);
			const message = serializeBlock(block);
			if (message.toUpperCase().includes(input.value.toUpperCase())) {
				blockList.push(blockDef, { kind: "sep", gap: 8 });
			}
			block.dispose();
		});
	}

	workspace.addChangeListener((ev) => {
		input.style.width = `${(workspace.getToolbox()?.getFlyout()?.getWidth() || 0) - 20}px`;
		if (ev.type !== "toolbox_item_select") return;

		if (workspace?.getToolbox()?.getSelectedItem()?.getId() === "l_search") {
			input.placeholder = Msg.SEARCH;
			input.focus();
		} else {
			input.value = "";
		}
	});

	return blockList;
}
