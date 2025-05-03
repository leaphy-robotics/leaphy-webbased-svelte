import type { BlockDefinition } from "blockly/core/blocks";

const motorLeftRightDropdown = [
	["%{BKY_LEAPHY_MOTOR_LEFT_DROPDOWN}", "9"],
	["%{BKY_LEAPHY_MOTOR_RIGHT_DROPDOWN}", "10"],
];

export enum MotorDirection {
	FORWARD = "1",
	BACKWARD = "2",
	LEFT = "3",
	RIGHT = "4",
}

const motorForwardBackwardDropdown = [
	["%{BKY_LEAPHY_MOTOR_FORWARD}", MotorDirection.FORWARD],
	["%{BKY_LEAPHY_MOTOR_BACKWARD}", MotorDirection.BACKWARD],
	["%{BKY_LEAPHY_MOTOR_LEFT}", MotorDirection.LEFT],
	["%{BKY_LEAPHY_MOTOR_RIGHT}", MotorDirection.RIGHT],
];

const blocks: BlockDefinition = [
	{
		type: "leaphy_original_set_led",
		helpUrl:
			"https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html#:~:text=Different%20types%20of%20leds",
		message0:
			"%%{BKY_LEAPHY_LED} %1 %%{BKY_LEAPHY_LED_RED} %2 %%{BKY_LEAPHY_LED_GREEN} %3 %%{BKY_LEAPHY_LED_BLUE} %4",
		args0: [
			{ type: "input_dummy" },
			{ type: "input_value", name: "LED_RED", check: "Number" },
			{ type: "input_value", name: "LED_GREEN", check: "Number" },
			{ type: "input_value", name: "LED_BLUE", check: "Number" },
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
	},
	{
		type: "leaphy_original_set_motor",
		helpUrl:
			"https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html#:~:text=types%20of%20leds-,TT%20motors,-Servo%20motors",
		message0: "%%{BKY_LEAPHY_MOTOR_TYPE} %1 %2 %%{BKY_LEAPHY_MOTOR_SPEED} %3",
		args0: [
			{
				type: "field_dropdown",
				name: "MOTOR_TYPE",
				options: motorLeftRightDropdown,
			},
			{ type: "input_dummy" },
			{ type: "input_value", name: "MOTOR_SPEED", check: "Number" },
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
	},
	{
		type: "leaphy_original_move_motors",
		helpUrl:
			"https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html#:~:text=types%20of%20leds-,TT%20motors,-Servo%20motors",
		message0: "%%{BKY_LEAPHY_MOTOR_DIRECTION} %1 %2  %3",
		args0: [
			{
				type: "field_dropdown",
				name: "MOTOR_DIRECTION",
				options: motorForwardBackwardDropdown,
			},
			{ type: "input_dummy" },
			{ type: "input_value", name: "MOTOR_SPEED", check: "Number" },
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
	},
	{
		type: "leaphy_original_buzz",
		message0:
			"%%{BKY_LEAPHY_BUZZ_BUZZ} %1 %%{BKY_LEAPHY_BUZZ_HERTZ} %2 %%{BKY_LEAPHY_BUZZ_MS}",
		args0: [
			{ type: "input_value", name: "FREQUENCY", check: "Number" },
			{ type: "input_value", name: "DURATION", check: "Number" },
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
	},
	{
		type: "leaphy_original_servo_set",
		helpUrl:
			"https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html#:~:text=TT%20motors-,Servo%20motors,-Rotating%20servo%20motor",
		message0: "%{BKY_LEAPHY_SERVO_SET}",
		args0: [
			{
				type: "field_dropdown",
				name: "MOTOR",
				options: [
					["%{BKY_LEAPHY_MOTOR_LEFT_DROPDOWN}", "left"],
					["%{BKY_LEAPHY_MOTOR_RIGHT_DROPDOWN}", "right"],
				],
			},
			{
				type: "input_value",
				name: "SPEED",
				check: "Number",
			},
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
	},
	{
		type: "leaphy_original_servo_move",
		helpUrl:
			"https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html#:~:text=TT%20motors-,Servo%20motors,-Rotating%20servo%20motor",
		message0: "%{BKY_LEAPHY_SERVO_MOVE}",
		args0: [
			{
				type: "field_dropdown",
				name: "DIRECTION",
				options: [
					["%{BKY_LEAPHY_MOTOR_FORWARD}", "forward"],
					["%{BKY_LEAPHY_MOTOR_BACKWARD}", "backward"],
					["%{BKY_LEAPHY_MOTOR_LEFT}", "left"],
					["%{BKY_LEAPHY_MOTOR_RIGHT}", "right"],
				],
			},
			{
				type: "input_value",
				name: "SPEED",
				check: "Number",
			},
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
	},
];

export { blocks };
