import type { BlockDefinition } from "blockly/core/blocks";

const blocks: BlockDefinition = [
	{
		type: "mesh_setup",
		style: "mesh_blocks",
		message0: "%{BKY_LEAPHY_MESH_SETUP}",
		args0: [
			{
				type: "field_input",
				name: "NAME",
				text: "Leaphy Mesh",
				spellcheck: false,
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
		type: "mesh_sender",
		style: "mesh_blocks",
		message0: "%{BKY_LEAPHY_MESH_SENDER}",
		output: "Number",
	},

	{
		type: "mesh_on_signal",
		message0: "%{BKY_LEAPHY_MESH_ON_SIGNAL}",
		args0: [
			{
				type: "input_dummy",
				name: "SIGNAL",
			},
		],
		inputsInline: true,
		extensions: ["mesh_signal_select_extension", "appendStatementInputStack"],
		style: "mesh_blocks",
	},
	{
		type: "mesh_broadcast_signal",
		message0: "%{BKY_LEAPHY_MESH_BROADCAST_SIGNAL}",
		args0: [
			{
				type: "input_dummy",
				name: "SIGNAL",
			},
		],
		inputsInline: true,
		extensions: ["mesh_signal_select_extension"],
		style: "mesh_blocks",
		previousStatement: null,
		nextStatement: null,
	},
	{
		type: "mesh_call_signal",
		message0: "%{BKY_LEAPHY_MESH_CALL_SIGNAL}",
		args0: [
			{
				type: "input_dummy",
				name: "SIGNAL",
			},
			{
				type: "input_value",
				name: "RECIPIENT",
				check: ["Number"],
			},
		],
		inputsInline: true,
		extensions: ["mesh_signal_select_extension"],
		style: "mesh_blocks",
		previousStatement: null,
		nextStatement: null,
	},
];

export { blocks };
