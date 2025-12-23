import type { BlockDefinition } from "blockly/core/blocks";

const blocks: BlockDefinition = [
	{
		type: "leaphy_i2c_rtc_get",
		message0: "%{BKY_LEAPHY_RTC_GET}",
		args0: [
			{
				type: "field_dropdown",
				name: "TYPE",
				options: [
					["%{BKY_LEAPHY_SECOND}", "second"],
					["%{BKY_LEAPHY_MINUTE}", "minute"],
					["%{BKY_LEAPHY_HOUR}", "hour"],
					["%{BKY_LEAPHY_WEEKDAY}", "weekday"],
					["%{BKY_LEAPHY_DAY}", "day"],
					["%{BKY_LEAPHY_MONTH}", "month"],
					["%{BKY_LEAPHY_YEAR}", "year"],
				],
			},
		],
		style: "leaphy_blocks",
		output: "Number",

		aiHelp: "RTC: Get the current time",
		relevanceKey: "RTC",
	},
	{
		type: "leaphy_i2c_rtc_set",
		message0: "%{BKY_LEAPHY_RTC_SET}",
		args0: [
			{
				type: "input_value",
				name: "VALUE",
				check: "String",
			},
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",

		aiHelp: "RTC: Set the current time",
		relevanceKey: "RTC",
	},
	{
		type: "leaphy_i2c_rtc_format",
		message0: "%{BKY_LEAPHY_RTC_FORMAT}",
		style: "leaphy_blocks",
		output: "String",
		mutator: "l_format_date_mutator",

		aiHelp: "RTC: Format the current time",
		relevanceKey: "RTC",
	},

	{
		type: "fmt_head",
		style: "logic_blocks",
		message0: "%{BKY_LEAPHY_FORMAT} %1",
		args0: [
			{
				type: "field_format",
				name: "FORMAT",
				options: [
					[
						"%{BKY_LEAPHY_TEMPLATE_FULL_NUMERIC}",
						[
							{
								type: "item",
								item: "day",
								fmt: "2-digit",
							},
							{
								type: "text",
								value: "/",
							},
							{
								type: "item",
								item: "month",
								fmt: "2-digit",
							},
							{
								type: "text",
								value: "/",
							},
							{
								type: "item",
								item: "year",
								fmt: "full",
							},
							{
								type: "text",
								value: " ",
							},
							{
								type: "item",
								item: "hour",
								fmt: "2-digit",
							},
							{
								type: "text",
								value: ":",
							},
							{
								type: "item",
								item: "minute",
								fmt: "2-digit",
							},
							{
								type: "text",
								value: ":",
							},
							{
								type: "item",
								item: "second",
								fmt: "2-digit",
							},
						],
					],
					[
						"%{BKY_LEAPHY_TEMPLATE_DATE_NUMERIC}",
						[
							{
								type: "item",
								item: "day",
								fmt: "numeric",
							},
							{
								type: "text",
								value: "/",
							},
							{
								type: "item",
								item: "month",
								fmt: "numeric",
							},
							{
								type: "text",
								value: "/",
							},
							{
								type: "item",
								item: "year",
								fmt: "full",
							},
						],
					],
					[
						"%{BKY_LEAPHY_TEMPLATE_FULL_TEXT}",
						[
							{
								type: "item",
								item: "weekday",
								fmt: "text",
							},
							{
								type: "text",
								value: " ",
							},
							{
								type: "item",
								item: "day",
								fmt: "numeric",
							},
							{
								type: "text",
								value: " ",
							},
							{
								type: "item",
								item: "month",
								fmt: "text",
							},
							{
								type: "text",
								value: " ",
							},
							{
								type: "item",
								item: "year",
								fmt: "full",
							},
							{
								type: "text",
								value: " ",
							},
							{
								type: "item",
								item: "hour",
								fmt: "numeric",
							},
							{
								type: "text",
								value: ":",
							},
							{
								type: "item",
								item: "minute",
								fmt: "2-digit",
							},
						],
					],
					[
						"%{BKY_LEAPHY_TEMPLATE_DATE_TEXT}",
						[
							{
								type: "item",
								item: "weekday",
								fmt: "text",
							},
							{
								type: "text",
								value: " ",
							},
							{
								type: "item",
								item: "day",
								fmt: "numeric",
							},
							{
								type: "text",
								value: " ",
							},
							{
								type: "item",
								item: "month",
								fmt: "text",
							},
							{
								type: "text",
								value: " ",
							},
							{
								type: "item",
								item: "year",
								fmt: "full",
							},
						],
					],
					[
						"%{BKY_LEAPHY_TEMPLATE_TIME}",
						[
							{
								type: "item",
								item: "hour",
								fmt: "2-digit",
							},
							{
								type: "text",
								value: ":",
							},
							{
								type: "item",
								item: "minute",
								fmt: "2-digit",
							},
							{
								type: "text",
								value: ":",
							},
							{
								type: "item",
								item: "second",
								fmt: "2-digit",
							},
						],
					],
				],
			},
		],
		extensions: ["appendStatementInputStack"],
	},
	{
		type: "fmt_text",
		message0: "%{BKY_LEAPHY_TEXT} %1",
		args0: [
			{
				type: "field_input",
				name: "TEXT",
				text: ":",
			},
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "text_blocks",
	},
	{
		type: "fmt_second",
		message0: "%{BKY_LEAPHY_SECOND} %{BKY_LEAPHY_WITH_FORMAT}",
		args0: [
			{
				type: "field_dropdown",
				name: "FMT",
				options: [
					["%{BKY_LEAPHY_NUMERIC}", "numeric"],
					["%{BKY_LEAPHY_2_DIGITS}", "2-digit"],
				],
			},
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
	},
	{
		type: "fmt_minute",
		message0: "%{BKY_LEAPHY_MINUTE} %{BKY_LEAPHY_WITH_FORMAT}",
		args0: [
			{
				type: "field_dropdown",
				name: "FMT",
				options: [
					["%{BKY_LEAPHY_NUMERIC}", "numeric"],
					["%{BKY_LEAPHY_2_DIGITS}", "2-digit"],
				],
			},
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
	},
	{
		type: "fmt_hour",
		message0: "%{BKY_LEAPHY_HOUR} %{BKY_LEAPHY_WITH_FORMAT}",
		args0: [
			{
				type: "field_dropdown",
				name: "FMT",
				options: [
					["%{BKY_LEAPHY_NUMERIC}", "numeric"],
					["%{BKY_LEAPHY_2_DIGITS}", "2-digit"],
				],
			},
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
	},
	{
		type: "fmt_weekday",
		message0: "%{BKY_LEAPHY_WEEKDAY} %{BKY_LEAPHY_WITH_FORMAT}",
		args0: [
			{
				type: "field_dropdown",
				name: "FMT",
				options: [
					["%{BKY_LEAPHY_NUMERIC}", "numeric"],
					["%{BKY_LEAPHY_TEXT}", "text"],
				],
			},
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
	},
	{
		type: "fmt_day",
		message0: "%{BKY_LEAPHY_DAY} %{BKY_LEAPHY_WITH_FORMAT}",
		args0: [
			{
				type: "field_dropdown",
				name: "FMT",
				options: [
					["%{BKY_LEAPHY_NUMERIC}", "numeric"],
					["%{BKY_LEAPHY_2_DIGITS}", "2-digit"],
				],
			},
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
	},
	{
		type: "fmt_month",
		message0: "%{BKY_LEAPHY_MONTH} %{BKY_LEAPHY_WITH_FORMAT}",
		args0: [
			{
				type: "field_dropdown",
				name: "FMT",
				options: [
					["%{BKY_LEAPHY_NUMERIC}", "numeric"],
					["%{BKY_LEAPHY_2_DIGITS}", "2-digit"],
					["%{BKY_LEAPHY_TEXT}", "text"],
				],
			},
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
	},
	{
		type: "fmt_year",
		message0: "%{BKY_LEAPHY_YEAR} %{BKY_LEAPHY_WITH_FORMAT}",
		args0: [
			{
				type: "field_dropdown",
				name: "FMT",
				options: [
					["%{BKY_LEAPHY_FULL}", "full"],
					["%{BKY_LEAPHY_2_DIGITS}", "2-digit"],
				],
			},
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
	},
];

export { blocks };
