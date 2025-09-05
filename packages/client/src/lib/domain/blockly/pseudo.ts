import AIState from "$state/ai.svelte";
import { type Block, ContextMenuRegistry, type Workspace } from "blockly";
import type { ISerializer } from "blockly/core/interfaces/i_serializer";
import { _ } from "svelte-i18n";
import { get } from "svelte/store";

function serializeBlock(
	block: Block,
	selected?: Block,
	indent = 0,
	inline = false,
) {
	if (!block) return "";

	const indentValue = "   ".repeat(indent);
	let value = indentValue;
	if (selected?.id === block.id)
		value += `**BEGIN_SELECT**${inline ? "" : `\n${indentValue}`}`;

	value += block.inputList
		.flatMap((input) => {
			const result = [];

			result.push(...input.fieldRow.map((field) => field.getText()));
			if (input.connection) {
				switch (input.connection.type) {
					case 1: {
						result.push(
							`(${serializeBlock(
								input.connection.targetBlock(),
								selected,
								0,
								true,
							)})`,
						);
						break;
					}
					case 3: {
						result.push(
							`{\n${serializeBlock(
								input.connection.targetBlock(),
								selected,
								indent + 1,
							)}\n${indentValue}}`,
						);
						break;
					}
				}
			}

			return result;
		})
		.join(" ");

	if (selected?.id === block.id)
		value += `${inline ? "" : `\n${indentValue}`}**END_SELECT**`;
	if (block.getNextBlock()) {
		value += `\n${serializeBlock(block.getNextBlock(), selected, indent)}`;
	}

	return value;
}

export function pseudo(workspace: Workspace, selected?: Block) {
	const blocks = workspace.getTopBlocks();

	return blocks.map((block) => serializeBlock(block, selected)).join("\n\n");
}

export const explainBlockOption: ContextMenuRegistry.RegistryItem = {
	id: "explain_block",
	scopeType: ContextMenuRegistry.ScopeType.BLOCK,
	displayText: () => get(_)("EXPLAIN_BLOCK"),
	weight: -1,
	preconditionFn() {
		return "enabled";
	},
	async callback(scope) {
		await AIState.explain(scope.block);
	},
};

export class PseudoSerializer implements ISerializer {
	priority = 0;

	clear() {}
	load() {}

	save(workspace: Workspace) {
		const blocks = workspace.getTopBlocks();
		return blocks.map((block) => serializeBlock(block)).join("\n\n");
	}
}
