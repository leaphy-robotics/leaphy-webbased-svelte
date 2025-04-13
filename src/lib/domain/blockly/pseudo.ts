import Explanation from "$components/core/popups/popups/Explanation.svelte";
import { Anchor } from "$state/popup.svelte";
import PopupState from "$state/popup.svelte";
import { type Block, ContextMenuRegistry, type Workspace } from "blockly";
import type * as Blockly from "blockly";
import type { ISerializer } from "blockly/core/interfaces/i_serializer";
import { _, locale } from "svelte-i18n";
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

function pseudo(workspace: Workspace, selected?: Block) {
	const blocks = workspace.getTopBlocks();

	return blocks.map((block) => serializeBlock(block, selected)).join("\n\n");
}

export async function explain(block: Blockly.BlockSvg) {
	const workspace = block.workspace;
	const code = pseudo(workspace, block);

	const locales = {
		en: "English",
		nl: "Dutch",
	};

	const position = block.pathObject.svgPath.getBoundingClientRect();
	await PopupState.open({
		component: Explanation,
		data: {
			explanation: fetch(`${import.meta.env.VITE_BACKEND_URL}/ai/generate`, {
				method: "post",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					messages: [
						{
							role: "system",
							content: `explain the selected portion of the following pseudo code (SELECT_BEGIN - SELECT_END) in simple terms, the pseudo code is directly generated from a blockly environment to program robots called Leaphy EasyBloqs, you must do this in ${
								locales[get(locale)]
							}`,
						},
						{
							role: "user",
							content: `\`\`\`\n${code}\n\`\`\``,
						},
						{
							role: "system",
							content:
								"please only return the explanation for the given set of code in simple terms, like you're explaining it to someone who has never touched code before, do not explain the code around the given set of code unless directly related, do not talk about or reference the pseudo code directly, you are talking about the selected code almost exclusively, so you do not have to include the **begin_select** and **end_select** tokens in your response, only include your explanation in the response",
						},
					],
					model: "Llama3-70b-8192",
				}),
			}).then(async (res) => {
				if (!res.ok) throw new Error(res.statusText);
				return JSON.parse(await res.text());
			}),
		},
		allowInteraction: true,

		position: {
			x: position.x + position.width + 10 - window.innerWidth / 2,
			y: position.y + 10 - window.innerHeight / 2,
		},
		anchor: Anchor.TopLeft,
	});
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
		await explain(scope.block);
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
