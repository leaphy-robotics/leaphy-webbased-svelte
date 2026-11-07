import { beforeEach, describe, expect, it } from "vitest";
import { sensorByType } from "../src/categories/ml/sensors";
import arduino from "../src/generators/arduino";

const setNode = (node: number, value: string) => `node[${node}] = ${value};\n`;

describe("ML sensors", () => {
	beforeEach(() => {
		arduino.setups_ = {};
		arduino.definitions_ = Object.create(null);
		arduino.includes_ = Object.create(null);
		arduino.dependencies.clear();
	});

	it("remaps analog pins used as digital pins on the ESP32", () => {
		arduino.boardType = "l_nano_esp32";
		const code = sensorByType.digital.getValues(arduino, setNode, {
			pin: "14",
		});

		expect(code).toContain("digitalRead(A0)");
		expect(Object.values(arduino.setups_)).toContain("pinMode(A0, INPUT);");
	});

	it("keeps digital pins untouched on AVR boards", () => {
		arduino.boardType = "l_nano";
		const code = sensorByType.digital.getValues(arduino, setNode, {
			pin: "14",
		});

		expect(code).toContain("digitalRead(14)");
	});

	it("reads digital Spark sensors through the IO expander", () => {
		arduino.boardType = "l_nano_esp32";
		const code = sensorByType.spark.getValues(arduino, setNode, {
			sensor: "left_line_sensor",
		});

		expect(code).toBe("node[0] = (sparkGPIO.input(3) ? 1 : 0);\n");
		expect(Object.values(arduino.setups_)).toContain(
			"sparkGPIO.config(3, TCA9534::Config::IN);",
		);
	});

	it("normalizes analog Spark sensors to 0-1", () => {
		arduino.boardType = "l_nano_esp32";
		const code = sensorByType.spark.getValues(arduino, setNode, {
			sensor: "potentiometer",
		});

		expect(code).toContain("ads.readADC_SingleEnded(2) / 32767.0f");
		expect(code).toContain("max(0.0f, min(1.0f,");
	});
});
