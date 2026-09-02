import type { BlockDefinition } from "../types";
import { testOutput } from "../utils";

export const blocks: BlockDefinition[] = [
	{
		type: "logic_compare",
		message0: "%1 %2 %3",
		args0: [
			{ type: "input_value", name: "A" },
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
			{ type: "input_value", name: "B" },
		],
		inputsInline: true,
		output: "Boolean",
		style: "logic_blocks",
		helpUrl: "%{BKY_LOGIC_COMPARE_HELPURL}",
		extensions: ["logic_op_tooltip"],
		aiHelp:
			"Compare two values using a comparison operator, returning a boolean value.",
	},
	{
		type: "math_map",
		message0:
			"%{BKY_MATH_MAP_TITLE} %1 %{BKY_MATH_MAP_FROM} %2 %{BKY_MATH_MAP_TO} %3 %{BKY_MATH_MAP_TARGET_FROM} %4 %{BKY_MATH_MAP_TARGET_TO} %5",
		args0: [
			{ type: "input_value", name: "VALUE", check: "Number" },
			{ type: "input_value", name: "FROM_LOW", check: "Number" },
			{ type: "input_value", name: "FROM_HIGH", check: "Number" },
			{ type: "input_value", name: "TO_LOW", check: "Number" },
			{ type: "input_value", name: "TO_HIGH", check: "Number" },
		],
		inputsInline: true,
		output: "Number",
		style: "math_blocks",
		tooltip: "%{BKY_MATH_MAP_TOOLTIP}",
		helpUrl: "https://www.arduino.cc/reference/en/language/functions/math/map/",
		test: testOutput("general"),
		aiHelp: "Map a value from one range to another",
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
		type: "text_charAt",
		message0: "%{BKY_TEXT_CHARAT_TITLE}",
		args0: [
			{ type: "input_value", name: "AT", check: "Number" },
			{ type: "input_value", name: "VALUE", check: "String" },
		],
		output: "String",
		style: "text_blocks",
		helpUrl: "%{BKY_TEXT_CHARAT_HELPURL}",
		inputsInline: true,
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
		type: "text_includes",
		message0: "%{BKY_TEXT_INCLUDES_TITLE}",
		args0: [
			{ type: "input_value", name: "VALUE", check: ["String"] },
			{ type: "input_value", name: "CHECK", check: ["String"] },
		],
		inputsInline: true,
		output: "Boolean",
		style: "text_blocks",
	},
	{
		type: "text_to_double",
		message0: "%{BKY_TEXT_TO_NUMBER}",
		args0: [{ type: "input_value", name: "VALUE", check: "String" }],
		output: "Number",
		style: "text_blocks",
		inputsInline: true,
	},
];
