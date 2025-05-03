import type { BlockDefinition } from "blockly/core/blocks";

const blocks: BlockDefinition = [
	{
		type: "mesh_setup",
		style: "mesh_blocks",
		message0: "%{BKY_LEAPHY_MESH_SETUP}",
		args0: [
			{
				type: "input_value",
				name: "NAME",
				check: ["String"],
			},
		],
		previousStatement: null,
		nextStatement: null,
	},
	{
		type: "mesh_update",
		style: "mesh_blocks",
		message0: "%{BKY_LEAPHY_MESH_UPDATE}",
		previousStatement: null,
		nextStatement: null,
	},
	{
		type: "mesh_add_procedure",
		style: "mesh_blocks",
		message0: "%{BKY_LEAPHY_MESH_ADD_PROCEDURE}",
		args0: [
			{
				type: "input_dummy",
				name: "METHOD",
			},
		],
		extensions: ["procedure_select_extension"],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
	},
	{
		type: "mesh_call_procedure",
		style: "mesh_blocks",
		message0: "%{BKY_LEAPHY_MESH_CALL_PROCEDURE}",
		args0: [
			{
				type: "input_dummy",
				name: "METHOD",
			},
			{
				type: "input_value",
				name: "TO",
				check: ["Number"],
			},
		],
		extensions: ["procedure_select_extension"],
		mutator: "procedure_arguments_extension",
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
	},
	{
		type: "mesh_call_procedure_all",
		style: "mesh_blocks",
		message0: "%{BKY_LEAPHY_MESH_CALL_PROCEDURE_ALL}",
		args0: [
			{
				type: "input_dummy",
				name: "METHOD",
			},
			{
				type: "input_dummy",
				name: "ARGUMENTS",
			},
		],
		extensions: ["procedure_select_extension"],
		mutator: "procedure_arguments_extension",
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
	},
	{
		type: "mesh_on_connection",
		style: "mesh_blocks",
		message0: "%{BKY_LEAPHY_MESH_ON_CONNECTION}",
		extensions: ["appendStatementInputStack"],
	},
	{
		type: "mesh_client",
		style: "mesh_blocks",
		message0: "%{BKY_LEAPHY_MESH_CLIENT}",
		output: "Number",
	},
];

export { blocks };
