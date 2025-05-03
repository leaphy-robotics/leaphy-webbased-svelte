import type { BlockDefinition } from "blockly/core/blocks";

const blocks: BlockDefinition = [
	{
		type: "text_includes",
		message0: "%{BKY_TEXT_INCLUDES_TITLE}",
		args0: [
			{
				type: "input_value",
				name: "VALUE",
				check: ["String"],
			},
			{
				type: "input_value",
				name: "CHECK",
				check: ["String"],
			},
		],
		inputsInline: true,
		output: "Boolean",
		style: "text_blocks",
	},
	{
		type: "text_join",
		message0: "%{BKY_TEXT_JOIN_TITLE_CREATEWITH}",
		args0: [
			{
				type: "input_value",
				name: "ADD0",
				check: ["String", "Number", "Boolean"],
			},
			{
				type: "input_value",
				name: "ADD1",
				check: ["String", "Number", "Boolean"],
			},
		],
		inputsInline: true,
		output: "String",
		style: "text_blocks",
	},
	{
		type: "text_length",
		message0: "%{BKY_TEXT_LENGTH_TITLE}",
		args0: [
			{
				type: "input_value",
				name: "VALUE",
				check: ["String"],
			},
		],
		output: "Number",
		style: "text_blocks",
		tooltip: "%{BKY_TEXT_LENGTH_TOOLTIP}",
		helpUrl: "%{BKY_TEXT_LENGTH_HELPURL}",
	},
	{
		type: "text_charAt",
		message0: "%{BKY_TEXT_CHARAT_TITLE}", // "in text %1 %2"
		args0: [
			{
				type: "input_value",
				name: "AT",
				check: "Number",
			},
			{
				type: "input_value",
				name: "VALUE",
				check: "String",
			},
		],
		output: "String",
		style: "text_blocks",
		helpUrl: "%{BKY_TEXT_CHARAT_HELPURL}",
		inputsInline: true,
	},
	{
		type: "text_to_double",
		message0: "%{BKY_TEXT_TO_NUMBER}",
		args0: [
			{
				type: "input_value",
				name: "VALUE",
				check: "String",
			},
		],
		output: "Number",
		style: "text_blocks",
		inputsInline: true,
	},
];

export { blocks };
