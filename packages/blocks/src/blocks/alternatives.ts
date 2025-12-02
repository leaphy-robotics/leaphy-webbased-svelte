import type { BlockDefinition } from "blockly/core/blocks";

const blocks: BlockDefinition[] = [
	{
		type: "controls_if",
		message0: "%{BKY_CONTROLS_IF_MSG_IF} %1 %{BKY_CONTROLS_IF_MSG_THEN} ",
		args0: [{ type: "input_value", name: "IF0", check: "Boolean" }],
		message1: "%1",
		args1: [{ type: "input_statement", name: "DO0" }],
		previousStatement: null,
		nextStatement: null,
		style: "loop_blocks",
		helpUrl: "%{BKY_CONTROLS_IF_HELPURL}",
		mutator: "controls_if_mutator",
		extensions: ["controls_if_tooltip"],
	},
	{
		type: "controls_repeat_forever",
		message0: "%{BKY_CONTROLS_REPEAT_FOREVER_TITLE}",
		message1: "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
		args1: [{ type: "input_statement", name: "DO" }],
		previousStatement: null,
		nextStatement: null,
		style: "loop_blocks",
		tooltip: "%{BKY_CONTROLS_REPEAT_TOOLTIP}",
		helpUrl: "%{BKY_CONTROLS_REPEAT_HELPURL}",
	},
	{
		type: "controls_if_if",
		message0: "%{BKY_CONTROLS_IF_IF_TITLE_IF}",
		nextStatement: null,
		enableContextMenu: false,
		style: "loop_blocks",
		tooltip: "%{BKY_CONTROLS_IF_IF_TOOLTIP}",
	},
	// Block representing the else-if statement in the controls_if mutator.
	{
		type: "controls_if_elseif",
		message0: "%{BKY_CONTROLS_IF_ELSEIF_TITLE_ELSEIF}",
		previousStatement: null,
		nextStatement: null,
		enableContextMenu: false,
		style: "loop_blocks",
		tooltip: "%{BKY_CONTROLS_IF_ELSEIF_TOOLTIP}",
	},
	// Block representing the else statement in the controls_if mutator.
	{
		type: "controls_if_else",
		message0: "%{BKY_CONTROLS_IF_ELSE_TITLE_ELSE}",
		previousStatement: null,
		enableContextMenu: false,
		style: "loop_blocks",
		tooltip: "%{BKY_CONTROLS_IF_ELSE_TOOLTIP}",
	},
	{
		type: "logic_compare",
		message0: "%1 %2 %3",
		args0: [
			{
				type: "input_value",
				name: "A",
			},
			{
				type: "field_dropdown",
				name: "OP",
				options: [
					["=", "EQ"],
					["\u2260", "NEQ"],
					["\u200F<", "LT"],
					["\u200F\u2264", "LTE"],
					["\u200F>", "GT"],
					["\u200F\u2265", "GTE"],
				],
			},
			{
				type: "input_value",
				name: "B",
			},
		],
		inputsInline: true,
		output: "Boolean",
		style: "logic_blocks",
		helpUrl: "%{BKY_LOGIC_COMPARE_HELPURL}",
		extensions: ["logic_op_tooltip"],

		aiHelp:
			"Compare two values using a comparison operator, returning a boolean value.",
	},
];

export { blocks };
