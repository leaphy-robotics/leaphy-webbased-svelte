import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";

export default function getCodeGenerators(arduino: Arduino) {
	function setupTCA9354() {
		arduino.addDependency(Dependencies.TCA9354_GPIO)
		arduino.addInclude("TCA9534", "#include <SparkFun_TCA9534.h>")
		arduino.addDefinition("spark-digital", "TCA9534 sparkGPIO;\n")
		arduino.addSetup("spark-digital", "if (sparkGPIO.begin(Wire, 0x20) == false) {\n" +
			"    Serial.println(\"Check Connections. No Spark GPIO detected.\");\n" +
			"    while (1);\n" +
			"  }")
	}

	arduino.forBlock.leaphy_spark_led = (block) => {
		setupTCA9354()

		const red =
			arduino.valueToCode(block, "RED", arduino.ORDER_ATOMIC) || "0";
		const green =
			arduino.valueToCode(block, "GREEN", arduino.ORDER_ATOMIC) || "0";
		const blue =
			arduino.valueToCode(block, "BLUE", arduino.ORDER_ATOMIC) || "0";

		arduino.addSetup(`spark-led`, "sparkGPIO.pinMode(0, GPIO_OUT);\n" +
			"sparkGPIO.pinMode(1, GPIO_OUT);\n" +
			"sparkGPIO.pinMode(2, GPIO_OUT);")

		return `sparkGPIO.digitalWrite(0, ${red});
sparkGPIO.digitalWrite(1, ${green});
sparkGPIO.digitalWrite(2, ${blue});`;
	};

	arduino.forBlock.leaphy_spark_read = (block) => {
		interface SensorConfig {
			pin: number,
			type: "digital" | "analog"
		}
		const spark_sensor_config: Record<string, SensorConfig> = {
			left_line_sensor: { type: "digital", pin: 3 },
			right_line_sensor: { type: "digital", pin: 4 },
			button_1: { type: "digital", pin: 7 },
			button_2: { type: "digital", pin: 6 },
			button_3: { type: "digital", pin: 5 },
			left_ambient: { type: "analog", pin: 1 },
			right_ambient: { type: "analog", pin: 0 },
			potentiometer: { type: "analog", pin: 2 },
		}

		const sensorType = block.getFieldValue("SPARK_SENSOR")
		const sensor = spark_sensor_config[sensorType]

		if (sensor.type === "digital") {
			setupTCA9354()
			arduino.addSetup(`spark-${sensorType}`, `sparkGPIO.pinMode(${sensor.pin}, GPIO_IN);`)

			return [`sparkGPIO.digitalRead(${sensor.pin})`, arduino.ORDER_ATOMIC]
		}

		if (sensor.type === "analog") {
			arduino.addDependency(Dependencies.ADS1X15_ADS)
			arduino.addInclude("ADS1X15", "#include <Adafruit_ADS1X15.h>")
			arduino.addDefinition("spark-analog", "Adafruit_ADS1115 ads;\n")
			arduino.addSetup("spark-analog", "  if (!ads.begin(0x48)) {\n" +
				"    Serial.println(\"Check Connections. No Spark Analog detected.\");\n" +
				"  }")

			return [`ads.readADC_SingleEnded(${sensor.pin})`, arduino.ORDER_ATOMIC]
		}

		return ['0', arduino.ORDER_ATOMIC]
	}
}
