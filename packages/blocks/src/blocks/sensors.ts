import type { BlockDefinition } from "../types";
import { testOutput, testStatement } from "../utils";

const accelerometerAxis = [
	["%{BKY_LEAPHY_ACCELEROMETER_AXIS_X}", "0"],
	["%{BKY_LEAPHY_ACCELEROMETER_AXIS_Y}", "1"],
	["%{BKY_LEAPHY_ACCELEROMETER_AXIS_Z}", "2"],
];

const gyroscopeAxis = [
	["%{BKY_LEAPHY_GYROSCOPE_AXIS_X}", "0"],
	["%{BKY_LEAPHY_GYROSCOPE_AXIS_Y}", "1"],
	["%{BKY_LEAPHY_GYROSCOPE_AXIS_Z}", "2"],
];

const rgbColor = [
	["%{BKY_COLOUR_RGB_RED}", "0"],
	["%{BKY_COLOUR_RGB_GREEN}", "1"],
	["%{BKY_COLOUR_RGB_BLUE}", "2"],
];

export const blocks: BlockDefinition[] = [
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
		test: testOutput("general"),
		helpUrl: "",
		aiHelp:
			"Read the digital value from a selected pin (automatic mode select)",
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
		test: testOutput("general"),
		helpUrl: "",
		aiHelp: "Read the analog value from a selected pin (automatic mode select)",
	},
	{
		type: "i2c_use_channel",
		message0: "%{BKY_USE_I2C_CHANNEL} %1",
		args0: [
			{
				type: "field_dropdown",
				name: "CHANNEL",
				options: [
					["0", "0"],
					["1", "1"],
					["2", "2"],
					["3", "3"],
					["4", "4"],
					["5", "5"],
					["6", "6"],
					["7", "7"],
				],
			},
		],
		message1: "%1",
		args1: [{ type: "input_statement", name: "DO" }],
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
		tooltip: "%{BKY_USE_I2C_CHANNEL_TOOLTIP}",
		test: testStatement("general"),
		helpUrl:
			"https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html#:~:text=Batteries%20and%20power-,I2C%20sensor%20module%C2%A0,-Sensors",
		aiHelp: "Select the I2C channel to use on the multiplexer",
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
		test: testOutput("general"),
		helpUrl:
			"https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html#:~:text=Programming-,Ultrasonic%20sensor,-Light%20sensor",
		aiHelp: "Read the distance from a selected HC-SR04 ultrasonic sensor",
	},
	{
		type: "leaphy_tof_get_distance",
		helpUrl:
			"https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html#:~:text=Light%20sensor-,ToF%20sensor%C2%A0,-Infrared%20sensor",
		message0: "%%{BKY_LEAPHY_TOF_GET_DISTANCE}",
		style: "leaphy_blocks",
		output: "Number",
		test: testOutput("i2c_generic"),
		aiHelp: "Read the distance from the VL53L0X ToF sensor",
		relevanceKey: "TOF_SENSOR",
	},
	{
		type: "leaphy_read_accelerometer",
		helpUrl: "",
		message0: "%{BKY_LEAPHY_READ_ACCELEROMETER}",
		args0: [
			{
				type: "field_dropdown",
				name: "ACCELEROMETER_AXIS",
				options: accelerometerAxis,
			},
		],
		style: "leaphy_blocks",
		output: "Number",
		test: testOutput("i2c_extra"),
		aiHelp:
			"Read the acceleration value from the LSM6DS3TRC accelerometer on a selected axis",
		relevanceKey: "ACCELEROMETER",
	},
	{
		type: "leaphy_read_gyroscope",
		helpUrl: "",
		message0: "%{BKY_LEAPHY_READ_GYROSCOPE}",
		args0: [
			{
				type: "field_dropdown",
				name: "GYROSCOPE_AXIS",
				options: gyroscopeAxis,
			},
		],
		style: "leaphy_blocks",
		output: "Number",
		test: testOutput("i2c_extra"),
		aiHelp:
			"Read the gyroscope value from the LSM6DS3TRC gyroscope on a selected axis",
		relevanceKey: "ACCELEROMETER",
	},
	{
		type: "leaphy_i2c_gesture",
		message0: "%%{BKY_LEAPHY_GET_GESTURE}",
		style: "leaphy_blocks",
		output: "Number",
		helpUrl: "",
		test: testOutput("i2c_generic"),
		aiHelp: "Read the gesture from the APDS9960 sensor",
		relevanceKey: "RGB_I2C_COLOR",
	},

	{
		type: "leaphy_tmp102_read_temperature",
		message0: "%%{BKY_LEAPHY_TMP102_READ_TEMPERATURE}",
		style: "leaphy_blocks",
		output: "Number",
		helpUrl: "",
		test: testOutput("i2c_generic"),
		aiHelp: "Read the temperature from the TMP102 sensor",
		relevanceKey: "TMP102_SENSOR",
	},
	{
		type: "leaphy_dht22_read_temperature",
		message0: "%%{BKY_LEAPHY_DHT22_READ_TEMPERATURE} %1",
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
		// no compile test since this sensor is only used by micropython
		aiHelp: "Read the temperature from the DHT22 sensor",
		relevanceKey: "DHT22_SENSOR",
	},
	{
		type: "leaphy_gas_sensor",
		message0: "%%{BKY_LEAPHY_CHOOSE_GAS} %1",
		args0: [
			{
				type: "field_dropdown",
				name: "GAS",
				options: [
					["TVOC", "TVOC"],
					["eCO2", "eCO2"],
					["Raw H2", "Raw H2"],
					["Raw Ethanol", "RAWETHANOL"],
				],
			},
		],
		style: "leaphy_blocks",
		output: "Number",
		helpUrl: "",
		test: testOutput("i2c_extra"),
		aiHelp:
			"Read the gas value from the SGP30 gas sensor (TVOC, eCO2, Raw H2, Raw Ethanol)",
		relevanceKey: "GAS_SENSOR",
	},
	{
		type: "leaphy_dht22_read_humidity",
		message0: "%%{BKY_LEAPHY_DHT22_READ_HUMIDITY} %1",
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
		// no compile test since this sensor is only used by micropython
		aiHelp: "Read the humidity from the DHT22 sensor",
		relevanceKey: "DHT22_SENSOR",
	},
	{
		type: "leaphy_get_air_pressure",
		message0: "%%{BKY_LEAPHY_GET_AIR_PRESSURE}",
		style: "leaphy_blocks",
		output: "Number",
		helpUrl: "",
		test: testOutput("i2c_extra"),
		aiHelp: "Read the air pressure from the BMP280 sensor",
		relevanceKey: "BMP280_SENSOR",
	},

	{
		type: "leaphy_rgb_color",
		message0: "%%{BKY_LEAPHY_RGB_READ_SENSOR} %1",
		args0: [
			{
				type: "field_dropdown",
				name: "COLOR_TYPE",
				options: rgbColor,
			},
		],
		style: "leaphy_blocks",
		output: "Number",
		helpUrl: "",
		test: testOutput("general"),
		aiHelp: "Read the RGB color from the TCS34725 sensor",
		relevanceKey: "RGB_COLOR",
	},

	{
		type: "leaphy_serial_available",
		message0: "%%{BKY_LEAPHY_SERIAL_AVAILABLE}",
		style: "leaphy_blocks",
		output: "Number",
		helpUrl: "",
		test: testOutput("general"),
		aiHelp: "Check if there is data available to read from on the serial port",
	},
	{
		type: "leaphy_serial_read_line",
		message0: "%%{BKY_LEAPHY_SERIAL_READ_LINE}",
		style: "leaphy_blocks",
		output: "String",
		helpUrl: "",
		test: testOutput("general"),
		aiHelp: "Read a line from the serial port",
	},
];
