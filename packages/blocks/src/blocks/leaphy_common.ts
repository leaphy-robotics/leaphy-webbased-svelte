import type { BlockDefinition } from "blockly/core/blocks";

const blocks: BlockDefinition = [
	{
		type: "digital_read",
		message0: "%%{BKY_LEAPHY_DIGITAL_READ} %1",
		args0: [
			{
				type: "field_pin_selector",
				name: "PIN",
				mode: "digital",
			},
		],
		style: "leaphy_blocks",
		output: "Number",
		helpUrl: "",

		aiHelp: `Read the digital value from a selected pin (automatic mode select)`,
	},
	{
		type: "analog_read",
		message0: "%%{BKY_LEAPHY_ANALOG_READ} %1",
		args0: [
			{
				type: "field_pin_selector",
				name: "PIN",
				mode: "analog",
			},
		],
		style: "leaphy_blocks",
		output: "Number",
		helpUrl: "",

		aiHelp: `Read the analog value from a selected pin (automatic mode select)`,
	},
	{
		type: "leaphy_servo_write",
		message0:
			"%%{BKY_ARD_SERVO_WRITE} %1 %2 %%{BKY_ARD_SERVO_WRITE_TO} %3 %%{BKY_ARD_SERVO_WRITE_DEG_180}",
		args0: [
			{
				type: "field_pin_selector",
				name: "SERVO_PIN",
				mode: "digital",
			},
			{ type: "input_dummy" },
			{ type: "input_value", name: "SERVO_ANGLE", check: "Number" },
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
		// "extensions": "refreshServoPinFields",
		helpUrl:
			"https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html#:~:text=TT%20motors-,Servo%20motors,-Rotating%20servo%20motor",

		aiHelp: `Write the servo angle to a selected pin`,
	},
	{
		type: "leaphy_servo_read",
		message0: "%%{BKY_ARD_SERVO_READ} %1",
		args0: [
			{
				type: "field_pin_selector",
				name: "SERVO_PIN",
				mode: "digital",
			},
		],
		output: "Number",
		style: "leaphy_blocks",
		// "extensions": "returnAndUpdateServoRead",
		helpUrl:
			"https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html#:~:text=TT%20motors-,Servo%20motors,-Rotating%20servo%20motor",

		aiHelp: `Read the servo angle from a selected pin`,
	},
	{
		type: "leaphy_io_digitalwrite",
		message0: "%%{BKY_ARD_DIGITALWRITE} %1 %%{BKY_ARD_WRITE_TO} %2",
		args0: [
			{
				type: "field_pin_selector",
				name: "PIN",
				mode: "digital",
			},
			{ type: "input_value", name: "STATE", check: "Boolean" },
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
		helpUrl: "http://arduino.cc/en/Reference/DigitalWrite",

		aiHelp: `Write the digital value to a selected pin (automatic mode select)`,
	},
	{
		type: "leaphy_multiplexer_digitalwrite",
		message0: "%%{BKY_ARD_SET_MULTIPLEXER} %1",
		args0: [
			{
				type: "field_dropdown",
				name: "PIN",
				options: [
					["Y0", "0"],
					["Y1", "1"],
					["Y2", "2"],
					["Y3", "3"],
					["Y4", "4"],
					["Y5", "5"],
					["Y6", "6"],
					["Y7", "7"],
				],
			},
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",

		aiHelp: `Write the digital value to a selected pin on the multiplexer`,
	},
	{
		type: "leaphy_io_analogwrite",
		message0: "%%{BKY_ARD_ANALOGWRITE} %1 %%{BKY_ARD_WRITE_TO} %2",
		args0: [
			{ type: "field_pin_selector", name: "PIN", mode: "pwm" },
			{ type: "input_value", name: "NUM", check: "Number" },
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
		// "extensions": "inputAndUpdateAnalog",
		helpUrl: "http://arduino.cc/en/Reference/AnalogWrite",

		aiHelp: `Write the analog value (pwm) to a selected pin (automatic mode select)`,
	},
	{
		type: "leaphy_sonar_read",
		message0:
			"%%{BKY_LEAPHY_SONAR_READ_TRIG} %1 %%{BKY_LEAPHY_SONAR_READ_ECHO} %2",
		args0: [
			{
				type: "field_pin_selector",
				name: "TRIG_PIN",
				mode: "digital",
				includeDefault: true,
			},
			{
				type: "field_pin_selector",
				name: "ECHO_PIN",
				mode: "digital",
				includeDefault: true,
			},
		],
		output: "Number",
		style: "leaphy_blocks",
		helpUrl:
			"https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html#:~:text=Programming-,Ultrasonic%20sensor,-Light%20sensor",
		
		aiHelp: `Read the distance from a selected HC-SR04 ultrasonic sensor`,
	},

	{
		type: "leaphy_segment_init",
		helpUrl:
			"https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html#:~:text=%C2%A0Single%20leds-,Segment%20display%C2%A0,-Oled%20display",
		message0: "%{BKY_LEAPHY_SEGMENT_INIT}",
		args0: [
			{
				type: "field_pin_selector",
				name: "CLK",
				mode: "digital",
			},
			{
				type: "field_pin_selector",
				name: "DIO",
				mode: "digital",
			},
		],
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",

		aiHelp: `Initialize the 4 digit segment display`,
		relevanceKey: "SEGMENT_DISPLAY"
	},
	{
		type: "leaphy_matrix_init",
		helpUrl:
			"https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html#:~:text=Multiple%20leds-,Led%20matrix%C2%A0,-Speaker%C2%A0",
		message0: "%{BKY_LEAPHY_MATRIX_INIT}",
		args0: [
			{
				type: "field_pin_selector",
				name: "DIN",
				mode: "digital",
			},
			{
				type: "field_pin_selector",
				name: "CLK",
				mode: "digital",
			},
			{
				type: "field_pin_selector",
				name: "CS",
				mode: "digital",
			},
		],
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",

		aiHelp: `Initialize the 8x8 LED matrix`,
		relevanceKey: "LED_MATRIX"
	},
	{
		type: "leaphy_sound_init",
		helpUrl:
			"https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html#:~:text=Led%20matrix-,Speaker%C2%A0,-Stichting",
		message0: "%{BKY_LEAPHY_SOUND_INIT}",
		args0: [
			{
				type: "field_pin_selector",
				name: "RX",
				mode: "digital",
			},
			{
				type: "field_pin_selector",
				name: "TX",
				mode: "digital",
			},
		],
		inputsInline: true,
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",

		aiHelp: `Initialize the speaker (RedMP3 module)`,
		relevanceKey: "REDMP3_MODULE"
	},
	{
		type: "leaphy_sdcard_write",
		message0: "%%{BKY_LEAPHY_SDCARD_WRITE}",
		message1: "%%{BKY_LEAPHY_SDCARD_WRITE_TO_FILE} %1",
		message2: "%%{BKY_LEAPHY_SDCARD_WRITE_VALUE} %1",
		args1: [{ type: "input_value", name: "FILENAME", check: "String" }],
		args2: [{ type: "input_value", name: "VALUE" }],
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
		tooltip: "CS=10",

		aiHelp: `Write a value to a file on the SD card`,
		relevanceKey: "SD_CARD"
	},
	{
		type: "leaphy_sdcard_remove",
		message0: "%{BKY_LEAPHY_SDCARD_REMOVE}",
		args0: [{ type: "input_value", name: "FILENAME", check: "String" }],
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",

		aiHelp: `Remove a file from the SD card`,
		relevanceKey: "SD_CARD"
	},
	{
		type: "leaphy_sdcard_mkdir",
		message0: "%{BKY_LEAPHY_SDCARD_MKDIR}",
		args0: [{ type: "input_value", name: "FILENAME", check: "String" }],
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",

		aiHelp: `Create a directory on the SD card`,
		relevanceKey: "SD_CARD"
	},
];

export { blocks };
