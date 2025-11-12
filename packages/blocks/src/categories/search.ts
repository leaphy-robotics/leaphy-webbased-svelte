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
import Extensions from "../../../client/src/lib/domain/blockly/extensions.svelte";
import { serializeBlock } from "../../../client/src/lib/domain/blockly/pseudo";

const input = document.createElement("input");
input.type = "text";

input.placeholder = "🔎 Start typing to search...";
input.style.position = "fixed";
input.style.left = "80px";
input.style.top = "65px";
input.style.zIndex = "99999";
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
	display: "none",
});
document.body.appendChild(input);

input.addEventListener("input", () => {
	(getMainWorkspace() as WorkspaceSvg).getToolbox()?.refreshSelection();
});

export default function (workspace: WorkspaceSvg) {
	let blockList: FlyoutDefinition = [
		{
			kind: "label",
			text: new Array(64).fill(" ").join(""),
		},
		{
			kind: "sep",
			gap: 60,
		},
	];

	if (input.value) {
		const toolbox = workspace.getToolbox() as Toolbox;
		const categories = Array.from(
			// biome-ignore lint/complexity/useLiteralKeys: protected properties must be accessed using brackets
			toolbox["contents"].values(),
		) as ToolboxCategory[];
		const enabledCategories = categories.filter((e) =>
			Extensions.isEnabled(e.getId()),
		);

		const blocks = new Map<string, BlockDefinition>();
		enabledCategories.forEach((category) => {
			if (category.getId() === "l_search") return;

			const contents = category.getContents();
			if (Array.isArray(contents)) {
				contents.forEach((block) => {
					if (!("type" in block) || !block.type) return;

					blocks.set(block.type, block);
				});
			} else {
				const callback = workspace.getToolboxCategoryCallback(contents);
				if (!callback) return;

				const customContents = callback(workspace) as FlyoutItemInfoArray;
				if (!Array.isArray(customContents)) return;

				customContents.forEach((block) => {
					if (!("type" in block) || !block.type) return;

					blocks.set(block.type, block);
				});
			}
		});

		const visibleBlocks: FlyoutItemInfoArray = [];
		blocks.forEach((blockDef, type) => {
			const block = new BlockSvg(workspace, type);
			const message = serializeBlock(block);
			if (message.toUpperCase().includes(input.value.toUpperCase())) {
				visibleBlocks.push(blockDef, { kind: "sep", gap: 8 });
			}
			block.dispose();
		});

		blockList.push(...visibleBlocks);
	}

	workspace.addChangeListener((ev) => {
		input.style.width = `${(workspace.getToolbox()?.getFlyout()?.getWidth() || 0) - 20}px`;
		if (ev.type !== "toolbox_item_select") return;

		if (workspace?.getToolbox()?.getSelectedItem()?.getId() === "l_search") {
			input.style.display = "block";
			input.placeholder = Msg.SEARCH;
			input.focus();
		} else {
			input.style.display = "none";
			input.value = "";
		}
	});

	return blockList;
}
