import robotGroups from "$domain/robots.groups";
import { RobotType } from "$domain/robots.types";
import { format } from "date-fns";

function number(value: number) {
	return {
		shadow: {
			type: "math_number",
			fields: { NUM: value },
		},
	};
}

function text(value: string) {
	return {
		shadow: {
			type: "text",
			fields: { TEXT: value },
		},
	};
}

function boolean() {
	return {
		shadow: {
			type: "logic_boolean",
		},
	};
}

export default [
	{
		name: "%{BKY_SENSOREN_CATEGORY}",
		style: "leaphy_category",
		id: "%robot%_sensors",
		robots: [
			...robotGroups.ALL,
			-RobotType.L_FLITZ_UNO,
			-RobotType.L_FLITZ_NANO,
		],
		groups: [
			[
				{
					type: "i2c_use_channel",
					robots: robotGroups.L_NANO_ALL,
				},
			],
			[
				{
					type: "digital_read",
				},
				{
					type: "analog_read",
				},
			],
			[
				{
					type: "leaphy_sonar_read",
					fields: { TRIG_PIN: "7", ECHO_PIN: "8" },
					robots: [
						...robotGroups.ALL,
						...robotGroups.L_NANO_ALL.map((e) => -e),
					],
				},
				{
					type: "leaphy_sonar_read",
					fields: { TRIG_PIN: "17", ECHO_PIN: "16" },
					robots: robotGroups.L_NANO_ALL,
				},
			],
			[
				{
					type: "leaphy_rgb_color",
				},
				{
					type: "leaphy_rgb_color_raw",
				},
				{
					type: "leaphy_gas_sensor",
				},
				{
					type: "leaphy_i2c_rgb_color",
				},
				{
					type: "leaphy_tof_get_distance",
				},
				{
					type: "leaphy_get_air_pressure",
				},
				{
					type: "leaphy_i2c_gesture",
				},
				{
					type: "leaphy_i2c_rtc_get",
				},
				{
					type: "leaphy_i2c_rtc_format",
					extraState: [
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
				},
				{
					type: "leaphy_read_accelerometer",
				},
				{
					type: "leaphy_read_gyroscope",
				},
			],
			[
				{
					kind: "block",
					type: "leaphy_serial_available",
				},
				{
					kind: "block",
					type: "leaphy_serial_read_line",
				},
			],
		],
	},

	{
		name: "%{BKY_ACTUATOREN_CATEGORY}",
		style: "leaphy_category",
		id: "%robot%_actuators",
		robots: [
			...robotGroups.ALL,
			-RobotType.L_FLITZ_UNO,
			-RobotType.L_FLITZ_NANO,
		],
		groups: [
			[
				{
					type: "leaphy_original_set_led",
					inputs: {
						LED_RED: number(0),
						LED_GREEN: number(0),
						LED_BLUE: number(0),
					},
				},
				{
					robots: [
						...robotGroups.ALL,
						...robotGroups.L_STARLING_ALL.map((e) => -e),
					],
					type: "leaphy_original_set_motor",
					inputs: {
						MOTOR_SPEED: number(100),
					},
				},
				{
					robots: [
						...robotGroups.ALL,
						...robotGroups.L_STARLING_ALL.map((e) => -e),
					],
					type: "leaphy_original_move_motors",
					inputs: {
						MOTOR_SPEED: number(100),
					},
				},
				{
					type: "leaphy_original_servo_set",
					robots: [
						...robotGroups.L_NANO_ALL,
						...robotGroups.L_ORIGINAL_NANO_ALL.map((e) => -e),
					],
					inputs: {
						SPEED: number(100),
					},
				},
				{
					type: "leaphy_original_servo_move",
					robots: [
						...robotGroups.L_NANO_ALL,
						...robotGroups.L_ORIGINAL_NANO_ALL.map((e) => -e),
					],
					inputs: {
						SPEED: number(100),
					},
				},
				{
					type: "leaphy_original_buzz",
					inputs: {
						FREQUENCY: number(440),
						DURATION: number(100),
					},
				},
				{
					type: "leaphy_serial_print_line",
					inputs: {
						VALUE: text("text"),
					},
				},
				{
					type: "leaphy_serial_print_value",
					inputs: {
						NAME: text("text"),
						VALUE: number(0),
					},
				},
				{
					type: "leaphy_io_digitalwrite",
				},
				{
					type: "leaphy_io_analogwrite",
					inputs: {
						NUM: number(0),
					},
				},
				{
					type: "leaphy_servo_write",
					inputs: {
						SERVO_ANGLE: number(90),
					},
				},
			],
			[
				{
					type: "leaphy_led_set_strip",
					inputs: {
						LED_SET_PIN: number(0),
						LED_SET_LEDS: number(0),
					},
				},
				{
					type: "leaphy_led_set_basic",
					inputs: {
						LED_SET_LED: number(0),
						LED_BASIC_RED: number(0),
						LED_BASIC_GREEN: number(0),
						LED_BASIC_BLUE: number(0),
					},
				},
				{
					type: "leaphy_led_set_speed",
					inputs: {
						LED_SET_SPEEDVALUE: number(0),
					},
				},
				{
					type: "leaphy_led_strip_demo",
					inputs: {
						LED_STRIP_DEMO_RED: number(0),
						LED_STRIP_DEMO_GREEN: number(0),
						LED_STRIP_DEMO_BLUE: number(0),
					},
				},
			],
			[
				{
					type: "leaphy_display_clear",
				},
				{
					type: "leaphy_display_set_text_size",
					inputs: {
						NUM: number(0),
					},
				},
				{
					type: "leaphy_display_print_line",
					inputs: {
						VALUE: text("text"),
					},
				},
				{
					type: "leaphy_display_print_value",
					inputs: {
						NAME: text("text"),
						VALUE: number(0),
					},
				},
				{
					type: "leaphy_display_display",
				},
			],
			[
				{
					type: "leaphy_display_large_clear",
				},
				{
					type: "leaphy_display_large_set_text_size",
					inputs: {
						NUM: number(0),
					},
				},
				{
					type: "leaphy_display_large_print_line",
					inputs: {
						VALUE: text("text"),
					},
				},
				{
					type: "leaphy_display_large_print_value",
					inputs: {
						NAME: text("text"),
						VALUE: number(0),
					},
				},
				{
					type: "leaphy_display_large_display",
				},
			],
			[
				{
					type: "leaphy_matrix_init",
				},
				{
					type: "leaphy_matrix_fill",
				},
				{
					type: "leaphy_matrix_set",
					inputs: {
						X: number(0),
						Y: number(0),
						ON: boolean(),
					},
				},
				{
					type: "leaphy_matrix_set_brightness",
					inputs: {
						BRIGHTNESS: number(100),
					},
				},
				{
					type: "leaphy_matrix_clear",
				},
			],
			[
				{
					type: "leaphy_segment_init",
				},
				{
					type: "leaphy_segment_set",
					inputs: {
						NUM: number(0),
					},
				},
				{
					type: "leaphy_segment_clear",
				},
				{
					type: "leaphy_segment_set_brightness",
					inputs: {
						BRIGHTNESS: number(0),
					},
				},
			],
			[
				{
					type: "leaphy_sound_init",
				},
				{
					type: "leaphy_sound_play",
					inputs: {
						ITEM: number(1),
					},
				},
				{
					type: "leaphy_sound_set_volume",
					inputs: {
						VOLUME: number(100),
					},
				},
				{
					type: "leaphy_sound_stop",
				},
			],
			[
				{
					type: "i2c_list_devices",
					robots: robotGroups.L_NANO_ALL,
				},
				{
					type: "i2c_use_channel",
					robots: robotGroups.L_NANO_ALL,
				},
				{
					type: "leaphy_i2c_rtc_set",
					inputs: {
						VALUE: text(format(new Date(), "yyMMddiHHmmss")),
					},
				},
			],
		],
	},
	{
		name: "Mesh",
		style: "mesh_category",
		id: "l_mesh",
		robots: [
			RobotType.L_NANO_ESP32,
			RobotType.L_ORIGINAL_NANO_ESP32,
			RobotType.L_STARLING_NANO_ESP32,
		],
		groups: [
			[
				{
					type: "mesh_setup",
					inputs: {
						NAME: text("Leaphy Mesh"),
					},
				},
				{
					type: "mesh_update",
				},
			],
			[
				{
					type: "mesh_on_connection",
				},
			],
			[
				{
					type: "mesh_add_procedure",
				},
				{
					type: "mesh_call_procedure",
					inputs: {
						TO: { shadow: { type: "mesh_client" } },
					},
				},
				{
					type: "mesh_call_procedure_all",
				},
			],
			[
				{
					type: "mesh_client",
				},
			],
		],
	},
	{
		name: "%{BKY_LEAPHY_FLITZ_CATEGORY}",
		style: "leaphy_category",
		id: "%robot%",
		robots: robotGroups.L_FLITZ_ALL,
		groups: [
			[
				{
					type: "leaphy_flitz_read_stomach_sensor",
					robots: [RobotType.L_FLITZ_UNO],
				},
				{
					type: "leaphy_flitz_nano_read_stomach_sensor",
					robots: [RobotType.L_FLITZ_NANO],
				},
				{
					type: "leaphy_flitz_read_hand_sensor",
					robots: [RobotType.L_FLITZ_UNO],
				},
				{
					type: "leaphy_flitz_nano_read_hand_sensor",
					robots: [RobotType.L_FLITZ_NANO],
				},
				{
					type: "leaphy_flitz_led",
					inputs: {
						FLITZ_LED_R: number(0),
						FLITZ_LED_G: number(0),
						FLITZ_LED_B: number(0),
					},
				},
				{
					type: "leaphy_serial_print_line",
					inputs: {
						VALUE: text("text"),
					},
				},
				{
					type: "leaphy_serial_print_value",
					inputs: {
						NAME: text("text"),
						VALUE: number(0),
					},
				},
				{
					type: "leaphy_servo_write",
					robots: [RobotType.L_FLITZ_NANO],
					inputs: {
						SERVO_ANGLE: number(90),
					},
				},
				{
					type: "leaphy_i2c_gesture",
					robots: [RobotType.L_FLITZ_NANO],
				},
				{
					type: "leaphy_i2c_rgb_color",
					robots: [RobotType.L_FLITZ_NANO],
				},
			],
		],
	},
	{
		name: "%{BKY_LEAPHY_SITUATION_CATEGORY}",
		style: "situation_category",
		id: "l_situation",
		groups: [
			[
				{
					type: "time_delay",
					inputs: {
						DELAY_TIME_MILI: number(1000),
					},
				},
				{
					type: "controls_repeat_forever",
				},
				{
					type: "controls_repeat_ext",
					inputs: {
						TIMES: number(10),
					},
				},
				{
					type: "controls_if",
				},
				{
					type: "controls_if",
					extraState: {
						hasElse: true,
					},
				},
				{
					type: "controls_whileUntil",
				},
			],
		],
	},
	{
		name: "%{BKY_LEAPHY_NUMBERS_CATEGORY}",
		style: "numbers_category",
		id: "l_numbers",
		robots: [...robotGroups.ALL, ...robotGroups.L_ARDUINO_ALL.map((e) => -e)],
		groups: [
			[
				{
					type: "math_number",
					fields: { NUM: 123 },
				},
				{
					type: "logic_compare",
					inputs: {
						A: number(1),
						B: number(1),
					},
				},
				{
					type: "math_arithmetic",
					inputs: {
						A: number(1),
						B: number(1),
					},
				},
				{
					type: "math_random_int",
					inputs: {
						FROM: number(1),
						TO: number(100),
					},
				},
				{
					type: "logic_operation",
				},
				{
					type: "logic_boolean",
				},
				{
					type: "logic_negate",
				},
				{
					type: "math_round",
					inputs: {
						NUM: number(3.1),
					},
				},
				{
					type: "math_number_property",
					inputs: {
						NUMBER_TO_CHECK: number(0),
					},
				},
				{
					type: "math_trig",
				},
				{
					type: "math_single",
				},
			],
		],
	},
	{
		name: "%{BKY_LEAPHY_OPERATORS_CATEGORY}",
		style: "numbers_category",
		id: "l_numbers",
		robots: robotGroups.L_ARDUINO_ALL,
		groups: [
			[
				{
					type: "math_number",
					fields: { NUM: 123 },
				},
				{
					type: "text",
					fields: { TEXT: "abc" },
				},
			],
			[
				{
					type: "logic_compare",
					inputs: {
						A: number(1),
						B: number(1),
					},
				},
				{
					type: "math_arithmetic",
					inputs: {
						A: number(1),
						B: number(1),
					},
				},
				{
					type: "math_random_int",
					inputs: {
						FROM: number(1),
						TO: number(100),
					},
				},
				{
					type: "logic_operation",
				},
				{
					type: "logic_boolean",
				},
				{
					type: "logic_negate",
				},
				{
					type: "math_round",
					inputs: {
						NUM: number(3.1),
					},
				},
				{
					type: "math_number_property",
					inputs: {
						NUMBER_TO_CHECK: number(0),
					},
				},
				{
					type: "math_trig",
				},
				{
					type: "math_single",
				},
			],
			[
				{
					type: "text_join",
					inputs: {
						ADD0: text("Hello "),
						ADD1: text("World"),
					},
				},
				{
					type: "text_charAt",
					inputs: {
						AT: number(0),
						VALUE: text("text"),
					},
				},
				{
					type: "text_length",
					inputs: {
						VALUE: text("text"),
					},
				},
				{
					type: "text_includes",
					inputs: {
						VALUE: text("apple"),
						CHECK: text("a"),
					},
				},
				{
					type: "text_to_double",
					inputs: {
						VALUE: text("123"),
					},
				},
			],
		],
	},
	{
		name: "%{BKY_LEAPHY_VARIABLES_CATEGORY}",
		style: "variables_category",
		id: "l_variables",
		custom: "VARIABLE",
	},
	{
		name: "%{BKY_LEAPHY_LISTS_CATEGORY}",
		style: "lists_category",
		id: "l_lists",
		robots: robotGroups.L_ARDUINO_ALL,
		custom: "LISTS",
	},
	{
		name: "%{BKY_LEAPHY_FUNCTIONS_CATEGORY}",
		style: "functions_category",
		id: "l_functions",
		custom: "PROCEDURE",
	},
];
