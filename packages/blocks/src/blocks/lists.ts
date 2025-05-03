import type { BlockDefinition } from "blockly/core/blocks";

const blocks: BlockDefinition = [
	{
		type: "lists_add",
		style: "list_blocks",
		message0: "%{BKY_LEAPHY_LISTS_ADD}",
		args0: [
			{
				type: "input_value",
				name: "VALUE",
			},
			{
				type: "input_dummy",
				name: "LIST",
			},
		],
		extensions: ["list_select_extension"],
		previousStatement: null,
		nextStatement: null,
	},
	{
		type: "lists_delete",
		style: "list_blocks",
		message0: "%{BKY_LEAPHY_LISTS_DELETE}",
		args0: [
			{
				type: "input_value",
				name: "INDEX",
			},
			{
				type: "input_dummy",
				name: "LIST",
			},
		],
		extensions: ["list_select_extension"],
		previousStatement: null,
		nextStatement: null,
	},
	{
		type: "lists_clear",
		style: "list_blocks",
		message0: "%{BKY_LEAPHY_LISTS_CLEAR}",
		args0: [
			{
				type: "input_dummy",
				name: "LIST",
			},
		],
		extensions: ["list_select_extension"],
		previousStatement: null,
		nextStatement: null,
	},
	{
		type: "lists_insert",
		style: "list_blocks",
		message0: "%{BKY_LEAPHY_LISTS_INSERT}",
		args0: [
			{
				type: "input_value",
				name: "VALUE",
			},
			{
				type: "input_value",
				name: "INDEX",
			},
			{
				type: "input_dummy",
				name: "LIST",
			},
		],
		extensions: ["list_select_extension"],
		previousStatement: null,
		nextStatement: null,
	},
	{
		type: "lists_replace",
		style: "list_blocks",
		message0: "%{BKY_LEAPHY_LISTS_REPLACE}",
		args0: [
			{
				type: "input_value",
				name: "INDEX",
			},
			{
				type: "input_dummy",
				name: "LIST",
			},
			{
				type: "input_value",
				name: "VALUE",
			},
		],
		extensions: ["list_select_extension"],
		previousStatement: null,
		nextStatement: null,
	},
	{
		type: "lists_get",
		style: "list_blocks",
		message0: "%{BKY_LEAPHY_LISTS_GET}",
		args0: [
			{
				type: "input_value",
				name: "INDEX",
			},
			{
				type: "input_dummy",
				name: "LIST",
			},
		],
		extensions: ["list_select_extension"],
		output: ["Number", "String"],
	},
	{
		type: "lists_length",
		style: "list_blocks",
		message0: "%{BKY_LEAPHY_LISTS_LENGTH}",
		args0: [
			{
				type: "input_dummy",
				name: "LIST",
			},
		],
		extensions: ["list_select_extension"],
		output: "Number",
	},
];

export { blocks };
