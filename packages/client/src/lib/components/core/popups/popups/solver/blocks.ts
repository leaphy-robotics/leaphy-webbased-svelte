import { getAllBlocks } from "$domain/blockly/blockly";
import { serializeBlock } from "$domain/blockly/pseudo";
import BlocklyState from "$state/blockly.svelte";
import { blocks } from "@leaphy-robotics/leaphy-blocks";
import { BlockSvg } from "blockly/core";
import type { BlockDefinition } from "blockly/core/blocks";

function filterRelevantBlocks(selectedBlocks: BlockDefinition[]) {
	const workspace = BlocklyState.workspace;
	const relevantKeys = new Set<string>();
	workspace.getAllBlocks().forEach((block) => {
		const blockDefinition = blocks.find((b) => b.type === block.type);
		console.log(blockDefinition);
		if (!blockDefinition || !blockDefinition.relevanceKey) return;
		console.log(blockDefinition.relevanceKey);

		relevantKeys.add(blockDefinition.relevanceKey);
	});
	console.log(relevantKeys);

	return selectedBlocks.filter((block) => {
		const blockDefinition = blocks.find((b) => b.type === block.type);
		if (!blockDefinition || !blockDefinition.relevanceKey) return true;

		return relevantKeys.has(blockDefinition.relevanceKey);
	});
}

function getBlockAiHelp(block: BlockDefinition) {
	const help = blocks.find((b) => b.type === block.type)?.aiHelp;
	if (!help) return "";

	return `(${help})`;
}

function formatBlocks(blocks: BlockDefinition[]) {
	return blocks
		.map((block) => {
			const blockSvg = new BlockSvg(BlocklyState.workspace, block.type);
			const message = serializeBlock(blockSvg);
			blockSvg.dispose();

			const aiHelp = getBlockAiHelp(block);
			return `${message} ${aiHelp}`;
		})
		.join("\n");
}

export function getBlocksMessage() {
	const blocks = getAllBlocks();
	const relevantBlocks = filterRelevantBlocks(blocks);

	console.log(blocks, relevantBlocks);
	return formatBlocks(relevantBlocks);
}
