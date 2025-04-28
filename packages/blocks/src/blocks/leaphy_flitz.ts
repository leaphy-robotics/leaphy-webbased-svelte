import type { BlockDefinition } from "blockly/core/blocks";

const stomachSensorOptions = [
	["%{BKY_LEAPHY_STOMACH_SENSOR_TYPE1}", "1"],
	["%{BKY_LEAPHY_STOMACH_SENSOR_TYPE2}", "2"],
];

const blocks: BlockDefinition = [
	{
		type: "leaphy_flitz_read_stomach_sensor",
		message0: "%%{BKY_LEAPHY_READ_STOMACH} %1",
		args0: [
			{
				type: "field_dropdown",
				name: "SENSOR_TYPE",
				options: stomachSensorOptions,
			},
		],
		helpUrl:
			"https://www.leaphy.nl/leaphy-flitz.html#:~:text=het%20licht%20wordt.-,Bouwfilmpjes%20Leaphy%20Flitz,-Software%20Leaphy%20Flitz",
		output: "Number",
		style: "leaphy_blocks",
	},
	{
		type: "leaphy_flitz_nano_read_stomach_sensor",
		message0: "%%{BKY_LEAPHY_READ_STOMACH}",
		output: "Number",
		helpUrl:
			"https://www.leaphy.nl/leaphy-flitz.html#:~:text=het%20licht%20wordt.-,Bouwfilmpjes%20Leaphy%20Flitz,-Software%20Leaphy%20Flitz",
		style: "leaphy_blocks",
	},
	{
		type: "leaphy_flitz_read_hand_sensor",
		message0: "%%{BKY_LEAPHY_READ_HAND}",
		output: "Number",
		helpUrl:
			"https://www.leaphy.nl/leaphy-flitz.html#:~:text=het%20licht%20wordt.-,Bouwfilmpjes%20Leaphy%20Flitz,-Software%20Leaphy%20Flitz",
		style: "leaphy_blocks",
	},
	{
		type: "leaphy_flitz_nano_read_hand_sensor",
		message0: "%%{BKY_LEAPHY_READ_HAND}",
		output: "Number",
		helpUrl:
			"https://www.leaphy.nl/leaphy-flitz.html#:~:text=het%20licht%20wordt.-,Bouwfilmpjes%20Leaphy%20Flitz,-Software%20Leaphy%20Flitz",
		style: "leaphy_blocks",
	},
	{
		type: "leaphy_flitz_led",
		message0:
			"%%{BKY_LEAPHY_FLITZ_LED} %1 %%{BKY_LEAPHY_FLITZ_LED_R} %2 %%{BKY_LEAPHY_FLITZ_LED_G} %3 %%{BKY_LEAPHY_FLITZ_LED_B} %4",
		args0: [
			{ type: "input_dummy" },
			{ type: "input_value", name: "FLITZ_LED_R", check: "Number" },
			{ type: "input_value", name: "FLITZ_LED_G", check: "Number" },
			{ type: "input_value", name: "FLITZ_LED_B", check: "Number" },
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		helpUrl:
			"https://www.leaphy.nl/leaphy-flitz.html#:~:text=het%20licht%20wordt.-,Bouwfilmpjes%20Leaphy%20Flitz,-Software%20Leaphy%20Flitz",
		style: "leaphy_blocks",
	},
];

export { blocks };
