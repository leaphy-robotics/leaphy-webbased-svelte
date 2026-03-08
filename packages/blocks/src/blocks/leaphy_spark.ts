import type { BlockDefinition } from "blockly/core/blocks";

const sparkSensorOptions = [
	["%{BKY_LEAPHY_SPARK_LEFT_LINE_SENSOR}", "left_line_sensor"],
	["%{BKY_LEAPHY_SPARK_RIGHT_LINE_SENSOR}", "right_line_sensor"],
	["%{BKY_LEAPHY_SPARK_POTENTIOMETER}", "potentiometer"],
	["%{BKY_LEAPHY_SPARK_LEFT_AMBIENT_LIGHT_SENSOR}", "left_ambient"],
	["%{BKY_LEAPHY_SPARK_RIGHT_AMBIENT_LIGHT_SENSOR}", "right_ambient"],
	["%{BKY_LEAPHY_SPARK_BUTTON} 1", "button_1"],
	["%{BKY_LEAPHY_SPARK_BUTTON} 2", "button_2"],
	["%{BKY_LEAPHY_SPARK_BUTTON} 3", "button_3"],
];

const blocks: BlockDefinition = [
	{
		type: "leaphy_spark_read",
		message0: "%{BKY_LEAPHY_SPARK_READ}",
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
			"%{BKY_LEAPHY_SPARK_RGB}",
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
