import {
	BlockSvg,
	Msg,
	type Toolbox,
	type ToolboxCategory,
	type WorkspaceSvg,
	getMainWorkspace,
} from "blockly/core";
import type { BlockDefinition } from "blockly/core/blocks";
import type {
	FlyoutDefinition,
	FlyoutItemInfoArray,
} from "blockly/core/utils/toolbox";
import { getAllBlocks } from "../../../client/src/lib/domain/blockly/blockly";
import Extensions from "../../../client/src/lib/domain/blockly/extensions.svelte";
import { serializeBlock } from "../../../client/src/lib/domain/blockly/pseudo";

const input = document.createElement("input");
input.type = "text";

input.placeholder = "🔎 Start typing to search...";
input.style.position = "fixed";
input.style.left = "80px";
input.style.top = "65px";
input.style.zIndex = "99999";
input.classList.add("search-input");
Object.assign(input.style, {
	position: "fixed",
	left: "80px",
	top: "65px",
	zIndex: "99999",
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
