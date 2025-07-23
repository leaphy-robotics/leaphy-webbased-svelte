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
	arduino.addDependency(Dependencies.LEAPHY_EXTENSIONS);
	arduino.addInclude("leaphy_extra", '#include "Leaphy_Extra.h"');

	return `getDistanceSonar(${trig}, ${echo})`;
}

export default function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.leaphy_tof_get_distance = () => {
		return [getTOF(arduino), arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_sonar_read = (block) => {
		const trig = block.getFieldValue("TRIG_PIN");
		const echo = block.getFieldValue("ECHO_PIN");

		return [getDistanceSonar(arduino, trig, echo), arduino.ORDER_ATOMIC];
	};
}
