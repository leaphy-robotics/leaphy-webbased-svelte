import type { BlockDefinition } from "blockly/core/blocks";

const sparkSensorOptions = [
	["left line sensor", "left_line_sensor"],
	["right line sensor", "right_line_sensor"],
	["potentiometer", "potentiometer"],
	["left ambient light sensor", "left_ambient"],
	["right ambient light sensor", "right_ambient"],
	["button 1", "button_1"],
	["button 2", "button_2"],
	["button 3", "button_3"],
];

const blocks: BlockDefinition = [
	{
		type: "leaphy_spark_read",
		message0: "Read from spark sensor %1",
		args0: [
			{
				type: "field_dropdown",
				name: "SPARK_SENSOR",
				options: sparkSensorOptions,
			},
		],
		style: "leaphy_blocks",
		output: "Number",
		helpUrl: "",

		aiHelp: `Read the sensor values of sensors on the Leaphy spark shield (options: ${sparkSensorOptions.map(([_name, id]) => id).join(', ')})`,
		relevanceKey: "SPARK",
	},
	{
		type: "leaphy_spark_led",
		message0:
			"Leaphy Spark LED red: %1, green: %2, blue: %3",
		args0: [
			{ type: "input_value", name: "RED", check: "Boolean" },
			{ type: "input_value", name: "GREEN", check: "Boolean" },
			{ type: "input_value", name: "BLUE", check: "Boolean" },
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",

		aiHelp: "Set the RGB color of the RGB LED on the Spark shield",
		relevanceKey: "SPARK",
	},
];

export { blocks };
