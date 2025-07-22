import type { BlockDefinition } from "blockly/core/blocks";

const blocks: BlockDefinition = [
	{
		type: "ml_classify",
		style: "ml_blocks",
		message0: "Classify inputs",
		previousStatement: null,
		nextStatement: null,
	},
	{
		type: "ml_certainty",
		message0: "%1 detected",
		args0: [
			{
				type: "input_dummy",
				name: "CLASS",
			},
		],
		inputsInline: true,
		extensions: ["class_select_extension"],
		style: "ml_blocks",
		output: "Boolean",
	},
];

export { blocks };
