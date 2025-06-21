import type { BlockDefinition } from "blockly/core/blocks";

const blocks: BlockDefinition = [
	{
		type: "ml_classify",
		style: "ml_blocks",
		message0: "Classify inputs",
		message1: "%1",
		args1: [
			{
				type: "input_statement",
				name: "DO",
			},
		],
		previousStatement: null,
		nextStatement: null,
	},
	{
		type: "ml_certainty",
		message0: "%1 certainty above %2%",
		args0: [
			{
				type: "input_dummy",
				name: "CLASS",
			},
			{
				type: "input_value",
				name: "CERTAINTY",
				check: "Number",
			},
		],
		extensions: ["class_select_extension"],
		style: "ml_blocks",
		output: "Boolean",
	},
];

export { blocks };
