import { ToF, Ultrasonic, WireColor } from "@leaphy-robotics/schemas/src";
import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";

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

export function getDistanceSonar(arduino: Arduino, trig: string, echo: string) {
	if (arduino.builder) {
		const sensor = arduino.builder.add(
			`ultrasonic-${trig}-${echo}`,
			Ultrasonic,
		);
		// if the sensor is connected via the I2C addon board
		if ((trig === "17" && echo === "16") || (trig === "A3" && echo === "A2")) {
			arduino.builder.connect(
				arduino.builder.i2c.port("VCC"),
				sensor.port("VCC"),
				WireColor.VCC,
			);
			arduino.builder.connect(
				arduino.builder.i2c.port("TRIG"),
				sensor.port("TRIG"),
				WireColor.TX,
			);
			arduino.builder.connect(
				arduino.builder.i2c.port("ECHO"),
				sensor.port("ECHO"),
				WireColor.RX,
			);
			arduino.builder.connect(
				arduino.builder.i2c.port("GND"),
				sensor.port("GND"),
				WireColor.GND,
			);
		} else {
			arduino.builder.connect(
				arduino.builder.murphy.port(`${trig}.3V3`),
				sensor.port("VCC"),
				WireColor.VCC,
			);
			arduino.builder.connect(
				arduino.builder.murphy.port(`${trig}`),
				sensor.port("TRIG"),
				WireColor.TX,
			);
			arduino.builder.connect(
				arduino.builder.murphy.port(`${echo}`),
				sensor.port("ECHO"),
				WireColor.RX,
			);
			arduino.builder.connect(
				arduino.builder.murphy.port(`${trig}.GND`),
				sensor.port("GND"),
				WireColor.GND,
			);
		}
	}
	arduino.addDependency(Dependencies.LEAPHY_EXTENSIONS);
	arduino.addInclude("leaphy_extra", '#include "Leaphy_Extra.h"');

	return `getDistanceSonar(${arduino.getRawPinMapping(trig)}, ${arduino.getRawPinMapping(echo)})`;
}

export default function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.leaphy_tof_get_distance = (block) => {
		arduino.addI2CDeviceToSchema("tof", block, ToF);

		return [getTOF(arduino), arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_sonar_read = (block) => {
		let defaultTrig = "7";
		let defaultEcho = "8";
		if (arduino.boardType.includes("nano")) {
			defaultTrig = "17";
			defaultEcho = "16";
		}

		const trig = arduino.getPinMapping(block, "TRIG_PIN", defaultTrig);
		const echo = arduino.getPinMapping(block, "ECHO_PIN", defaultEcho);

		return [getDistanceSonar(arduino, trig, echo), arduino.ORDER_ATOMIC];
	};
}
