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

		aiHelp: `Setup the Mesh network`,
		relevanceKey: "MESH"
	},
	{
		type: "mesh_update",
		style: "mesh_blocks",
		message0: "%{BKY_LEAPHY_MESH_UPDATE}",
		previousStatement: null,
		nextStatement: null,

		aiHelp: `Update the Mesh network (required to always run in loop if mesh is used)`,
		relevanceKey: "MESH"
	},

	{
		type: "mesh_sender",
		style: "mesh_blocks",
		message0: "%{BKY_LEAPHY_MESH_SENDER}",
		output: "Number",

		aiHelp: `Get the sender of the last received message`,
		relevanceKey: "MESH"
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

		aiHelp: `When I receive a selected signal`,
		relevanceKey: "MESH"
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

		aiHelp: `Broadcast a selected signal`,
		relevanceKey: "MESH"
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

		aiHelp: `Send a selected signal to a selected recipient`,
		relevanceKey: "MESH"
	},
];

export { blocks };
