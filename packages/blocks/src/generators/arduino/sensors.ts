import { Gas } from "@leaphy-robotics/schemas";
import {
	LightSensor,
	LineSensor,
	ToF,
	Ultrasonic,
	WireColor,
} from "@leaphy-robotics/schemas/src";
import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";
import { addI2CDeclarations } from "./i2c";

export function getTOF(arduino: Arduino) {
	arduino.addDependency(Dependencies.ADAFRUIT_VL53L0X_TOF);
	arduino.addInclude("leaphy_tof", "#include <Adafruit_VL53L0X.h>");
	arduino.addDeclaration("leaphy_tof", "Adafruit_VL53L0X i2c_distance;");
	const setup = arduino.addI2CSetup(
		"tof",
		"i2c_distance.begin();\n" +
			"      i2c_distance.setMeasurementTimingBudgetMicroSeconds(20000);\n",
	);
	arduino.addDeclaration(
		"leaphy_tof_read",
		`int getTOF() {\n    ${setup}\n    VL53L0X_RangingMeasurementData_t measure;\n    i2c_distance.rangingTest(&measure, false);\n    if (measure.RangeStatus == 4) return -1;\n    delay(33);\n    return measure.RangeMilliMeter;\n}`,
	);
	return "getTOF()";
}

export function getDistanceSonar(arduino: Arduino, trig: string, echo: string) {
	if (arduino.builder) {
		const sensor = arduino.builder.add(
			`ultrasonic-${trig}-${echo}`,
			Ultrasonic,
		);
		const useAddon =
			(trig === "17" && echo === "16") || (trig === "A3" && echo === "A2");
		const source = useAddon ? arduino.builder.i2c : arduino.builder.murphy;
		arduino.builder.connect(
			source.port(useAddon ? "VCC" : `${trig}.3V3`),
			sensor.port("VCC"),
			WireColor.VCC,
		);
		arduino.builder.connect(
			source.port(useAddon ? "TRIG" : trig),
			sensor.port("TRIG"),
			WireColor.TX,
		);
		arduino.builder.connect(
			source.port(useAddon ? "ECHO" : echo),
			sensor.port("ECHO"),
			WireColor.RX,
		);
		arduino.builder.connect(
			source.port(useAddon ? "GND" : `${trig}.GND`),
			sensor.port("GND"),
			WireColor.GND,
		);
	}

	arduino.addDependency(Dependencies.LEAPHY_EXTENSIONS);
	arduino.addInclude("leaphy_extra", '#include "Leaphy_Extra.h"');
	const debug = arduino.createDebug(`sonar-${trig}-${echo}`, {
		type: "basic",
		name: `Sonar trig: ${trig}, echo: ${echo}`,
		values: 1,
		unit: "cm",
		simulation: "distance",
	});
	return debug(
		`getDistanceSonar(${arduino.getRawPinMapping(trig)}, ${arduino.getRawPinMapping(echo)})`,
	);
}

export function getLidarValue(pixel: number) {
	return `min(1.0f, getLidar(${pixel}) / 500.0f)`;
}

export function measureLidar(arduino: Arduino) {
	arduino.addDependency(Dependencies.SPARKFUN_VL53L5CX);
	arduino.addInclude("leaphy_lidar", "#include <SparkFun_VL53L5CX_Library.h>");
	arduino.addDeclaration(
		"leaphy_lidar",
		"SparkFun_VL53L5CX lidar;\nVL53L5CX_ResultsData lidarResults;",
	);
	const setup = arduino.addI2CSetup(
		"lidar",
		"lidar.begin();\n      lidar.setResolution(8*8);\n      lidar.setRangingFrequency(15);\n      lidar.startRanging();",
	);
	arduino.addDeclaration(
		"leaphy_lidar_measure",
		`void lidarMeasure() {\n    ${setup}\n    lidar.getRangingData(&lidarResults);\n}`,
	);
	arduino.addDeclaration(
		"leaphy_lidar_read",
		"int getLidar(int pixel) {\n    return lidarResults.distance_mm[pixel];\n}",
	);
	return "lidarMeasure()";
}

function addAccelerometer(arduino: Arduino) {
	arduino.addDependency(Dependencies.ADAFRUIT_LSM6DS_ACCELEROMETER);
	arduino.addInclude("GyroAccel", "#include <Adafruit_LSM6DS3TRC.h>");
	const setup = arduino.addI2CSetup(
		"GyroAccel",
		"if (!lsm6ds3trc.begin_I2C()) {\n" +
			"        return;\n" +
			"      }\n\n" +
			"      lsm6ds3trc.configInt1(false, false, true);\n" +
			"      lsm6ds3trc.configInt2(false, true, false);\n",
	);
	arduino.addDeclaration(
		"GyroAccel",
		"Adafruit_LSM6DS3TRC lsm6ds3trc;\n" +
			"float buffer_x = 0.0, buffer_y = 0.0, buffer_z = 0.0;\n\n",
		false,
		3,
	);
	return setup;
}

export default function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.digital_read = (block) => {
		const pin = arduino.getPinMapping(block, "PIN");
		if (arduino.builder) {
			const sensor = arduino.builder.add(`digital-${pin}`, LineSensor);
			arduino.builder.connect(
				arduino.builder.murphy.port(pin),
				sensor.port("Out"),
				WireColor.DATA_1,
			);
			arduino.builder.connect(
				arduino.builder.murphy.port(`${pin}.3V3`),
				sensor.port("3V3"),
				WireColor.VCC,
			);
			arduino.builder.connect(
				arduino.builder.murphy.port(`${pin}.GND`),
				sensor.port("GND"),
				WireColor.GND,
			);
		}
		arduino.setups_[`setup_input_${pin}`] = `pinMode(${pin}, INPUT);`;
		const debug = arduino.createDebug(`digital-input-${pin}`, {
			type: "basic",
			name: `Digital input ${pin}`,
			values: 1,
		});
		return [debug(`digitalRead(${pin})`), arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.analog_read = (block) => {
		const pin = arduino.getPinMapping(block, "PIN");
		if (arduino.builder) {
			const sensor = arduino.builder.add(`analog-${pin}`, LightSensor);
			arduino.builder.connect(
				arduino.builder.murphy.port(pin),
				sensor.port("Out"),
				WireColor.DATA_1,
			);
			arduino.builder.connect(
				arduino.builder.murphy.port(`${pin}.3V3`),
				sensor.port("VCC"),
				WireColor.VCC,
			);
			arduino.builder.connect(
				arduino.builder.murphy.port(`${pin}.GND`),
				sensor.port("GND"),
				WireColor.GND,
			);
		}
		const debug = arduino.createDebug(`analog-input-${pin}`, {
			type: "basic",
			name: `Analog input ${pin}`,
			values: 1,
		});
		return [debug(`analogRead(${pin})`), arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.i2c_use_channel = (block) => {
		const channel = block.getFieldValue("CHANNEL");
		const innerCode = arduino.statementToCode(block, "DO");
		addI2CDeclarations();
		return `i2cSelectChannel(${channel});\n${innerCode}i2cRestoreChannel();\n`;
	};

	arduino.forBlock.leaphy_sonar_read = (block) => {
		const nano = arduino.boardType.includes("nano");
		const trig = arduino.getPinMapping(block, "TRIG_PIN", nano ? "17" : "7");
		const echo = arduino.getPinMapping(block, "ECHO_PIN", nano ? "16" : "8");
		return [getDistanceSonar(arduino, trig, echo), arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_tof_get_distance = (block) => {
		arduino.addI2CDeviceToSchema("tof", block, ToF);
		return [getTOF(arduino), arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_read_accelerometer = (block) => {
		const setup = addAccelerometer(arduino);
		arduino.addDeclaration(
			"Accelerometer",
			`double readAccelerometer(int channel) {\n  ${setup}  lsm6ds3trc.readAcceleration(buffer_x, buffer_y, buffer_z);\n\n  switch(channel) {\n    case 0:\n      return (double) buffer_x;\n    case 1:\n      return (double) buffer_y;\n    case 2:\n      return (double) buffer_z;\n  }\n}`,
			false,
			2,
		);
		return [
			`readAccelerometer(${block.getFieldValue("ACCELEROMETER_AXIS")})`,
			arduino.ORDER_ATOMIC,
		];
	};

	arduino.forBlock.leaphy_read_gyroscope = (block) => {
		const setup = addAccelerometer(arduino);
		arduino.addDeclaration(
			"Gyroscope",
			`double readGyroscope(int channel) {\n  ${setup}  lsm6ds3trc.readGyroscope(buffer_x, buffer_y, buffer_z);\n\n  switch(channel) {\n    case 0:\n      return (double) buffer_x;\n    case 1:\n      return (double) buffer_y;\n    case 2:\n      return (double) buffer_z;\n  }\n}`,
			false,
			2,
		);
		return [
			`readGyroscope(${block.getFieldValue("GYROSCOPE_AXIS")})`,
			arduino.ORDER_ATOMIC,
		];
	};

	arduino.forBlock.leaphy_i2c_gesture = () => {
		const setup = arduino.addI2CSetup("apds9960", "APDS.begin();\n");
		arduino.addDependency(Dependencies.APDS9960_RGB);
		arduino.addInclude("apds9960", "#include <Arduino_APDS9960.h>");
		arduino.addDeclaration(
			"apds9960_gesture",
			`int gesture[8];\nint getAPDS9960Gesture() {\n    ${setup}    uint8_t channel = i2cGetChannel();\n    if (APDS.gestureAvailable()) {\n        gesture[channel] = APDS.readGesture();\n    }\n    return gesture[channel];\n}\n`,
		);
		return ["getAPDS9960Gesture()", arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_tmp102_read_temperature = () => {
		arduino.addDependency(Dependencies.SPARKFUN_TMP102);
		arduino.addInclude("tmp102", "#include <SparkFunTMP102.h>");
		arduino.addDeclaration("tmp102", "TMP102 tmp102;");
		const setup = arduino.addI2CSetup(
			"tmp102",
			"if (!tmp102.begin()) {\n" +
				'        Serial.println(F("TMP102 not found"));\n' +
				"      }\n",
		);
		arduino.addDeclaration(
			"tmp102_read_temperature",
			`float getTMP102Temperature() {\n    ${setup}\n    tmp102.wakeup();\n    return tmp102.readTempC();\n}`,
		);
		return ["getTMP102Temperature()", arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_gas_sensor = (block) => {
		arduino.addI2CDeviceToSchema("gas", block, Gas);
		arduino.addDependency(Dependencies.ADAFRUIT_SGP30_GAS);
		arduino.addInclude("leaphy_gas_sensor", "#include <Adafruit_SGP30.h>");
		arduino.addDeclaration("leaphy_gas_sensor", "Adafruit_SGP30 sgp;");
		const setup = arduino.addI2CSetup("gas", "if (! sgp.begin()) return;\n");
		const gas = block.getFieldValue("GAS");
		const definitions: Record<string, [string, string]> = {
			TVOC: ["getGasValueTVOC", "sgp.IAQmeasure();\n    return sgp.TVOC;"],
			eCO2: ["getGasValueCOTWO", "sgp.IAQmeasure();\n    return sgp.eCO2;"],
			"Raw H2": [
				"getGasValueHTWO",
				"sgp.IAQmeasureRaw();\n    return sgp.rawH2;",
			],
			RAWETHANOL: [
				"getGasValueETHANOL",
				"sgp.IAQmeasureRaw();\n    return sgp.rawEthanol;",
			],
		};
		const [name, body] = definitions[gas];
		arduino.addDeclaration(
			`leaphy_gas_${name}`,
			`int ${name}() {\n    ${setup}    ${body}\n}\n`,
		);
		return [`${name}()`, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_get_air_pressure = () => {
		arduino.addDependency(Dependencies.ADAFRUIT_BMP280_BAR);
		arduino.addInclude("bmp280", "#include <Adafruit_BMP280.h>");
		arduino.addDeclaration("bmp280", "Adafruit_BMP280 bmp280;");
		const setup = arduino.addI2CSetup(
			"bmp280",
			"bmp280.begin(BMP280_ADDRESS_ALT);\n" +
				"      bmp280.setSampling(Adafruit_BMP280::MODE_NORMAL,\n" +
				"                      Adafruit_BMP280::SAMPLING_X2,\n" +
				"                      Adafruit_BMP280::SAMPLING_X16,\n" +
				"                      Adafruit_BMP280::FILTER_X16,\n" +
				"                      Adafruit_BMP280::STANDBY_MS_500);\n",
		);
		arduino.addDeclaration(
			"bmp280_get_air_pressure",
			`double getAirPressure() {\n    ${setup}\n    return bmp280.readPressure() / 100;\n}`,
		);
		return ["getAirPressure()", arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_rgb_color = (block) => {
		const setup = arduino.addI2CSetup(
			"rgb_color",
			'if (!tcs.begin()) {Serial.println("RGB sensor not found!");}\n',
		);
		arduino.addDependency(Dependencies.ADAFRUIT_TCS34725);
		arduino.addInclude("define_leaphy_rgb", '#include "Adafruit_TCS34725.h"');
		arduino.addInclude(
			"adafruit_tcs",
			"Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_24MS, TCS34725_GAIN_16X);\n",
		);
		arduino.addDeclaration(
			"rgb_color",
			`double getColor(int colorCode) {\n	${setup}	uint16_t r, g, b, c;\n	tcs.getRawData(&r, &g, &b, &c);\n	switch(colorCode) {\n		case 0: return min(r/5, 255);\n		case 1: return min(g/5, 255);\n		case 2: return min(b/5, 255);\n	}\n	return 0;\n}\n`,
		);
		return [
			`getColor(${block.getFieldValue("COLOR_TYPE")})`,
			arduino.ORDER_ATOMIC,
		];
	};

	arduino.forBlock.leaphy_serial_available = () => [
		"Serial.available()",
		arduino.ORDER_ATOMIC,
	];

	arduino.forBlock.leaphy_serial_read_line = () => [
		"Serial.readStringUntil('\\n')",
		arduino.ORDER_ATOMIC,
	];
}
