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

export function getDistanceSonar(arduino: Arduino, trig: string, echo: string) {
	const sensor = arduino.builder.add(`ultrasonic-${trig}-${echo}`, Ultrasonic);

	// if the sensor is connected via the I2C addon board
	if ((trig === "17" && echo === "16") || (trig === "A3" && echo === "A2")) {
		arduino.builder.connect(
			arduino.i2c.port("VCC"),
			sensor.port("VCC"),
			WireColor.VCC,
		);
		arduino.builder.connect(
			arduino.i2c.port("TRIG"),
			sensor.port("TRIG"),
			WireColor.TX,
		);
		arduino.builder.connect(
			arduino.i2c.port("ECHO"),
			sensor.port("ECHO"),
			WireColor.RX,
		);
		arduino.builder.connect(
			arduino.i2c.port("GND"),
			sensor.port("GND"),
			WireColor.GND,
		);
	} else {
		arduino.builder.connect(
			arduino.murphy.port(`${trig}.3V3`),
			sensor.port("VCC"),
			WireColor.VCC,
		);
		arduino.builder.connect(
			arduino.murphy.port(`${trig}`),
			sensor.port("TRIG"),
			WireColor.TX,
		);
		arduino.builder.connect(
			arduino.murphy.port(`${echo}`),
			sensor.port("ECHO"),
			WireColor.RX,
		);
		arduino.builder.connect(
			arduino.murphy.port(`${trig}.GND`),
			sensor.port("GND"),
			WireColor.GND,
		);
	}

	arduino.addDependency(Dependencies.LEAPHY_EXTENSIONS);
	arduino.addInclude("leaphy_extra", '#include "Leaphy_Extra.h"');

	return `getDistanceSonar(${trig}, ${echo})`;
}

export default function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.leaphy_tof_get_distance = (block) => {
		arduino.addI2CDeviceToSchema("tof", block, ToF);

		return [getTOF(arduino), arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_sonar_read = (block) => {
		const trig = block.getFieldValue("TRIG_PIN");
		const echo = block.getFieldValue("ECHO_PIN");

		return [getDistanceSonar(arduino, trig, echo), arduino.ORDER_ATOMIC];
	};
}
