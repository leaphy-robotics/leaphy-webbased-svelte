import type { BlockDefinition } from "blockly/core/blocks";

const blocks: BlockDefinition = [
	{
		type: "ml_classify",
		style: "ml_blocks",
		message0: "%{BKY_ML_CLASSIFY}",
		previousStatement: null,
		nextStatement: null,

		aiHelp:
			"ML: Classify the input data (should be called before checking certainty values)",
		relevanceKey: "ML",
	},
	{
		type: "ml_certainty",
		message0: "%{BKY_ML_CERTAINTY}",
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

		aiHelp: "ML: Check the certainty of the class as a boolean",
		relevanceKey: "ML",
	},

	{
		type: "ml_model",
		lastDummyAlign0: "CENTRE",
		message0: "%{BKY_ML_MODEL}",
		style: "ml_blocks",
		extensions: ["appendStatementInputStack"],
		isDeletable: false,
		helpUrl: "",
	},
	{
		type: "ml_layer",
		message0: "%{BKY_ML_LAYER_DENSE_RELU}",
		args0: [
			{
				type: "field_number",
				name: "UNITS",
				value: 9,
			},
		],
		style: "ml_blocks",
		previousStatement: null,
		nextStatement: null,
	},
];

export { blocks };
