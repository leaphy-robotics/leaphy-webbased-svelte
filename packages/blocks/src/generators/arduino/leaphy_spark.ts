import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";

export default function getCodeGenerators(arduino: Arduino) {
	function setupTCA9354() {
		arduino.addDependency(Dependencies.TCA9354_GPIO);
		arduino.addInclude("TCA9534", "#include <TCA9534.h>");
		arduino.addDefinition("spark-digital", "TCA9534 sparkGPIO;\n");
		arduino.addSetup("spark-digital", "Wire.begin();\n  sparkGPIO.attach(Wire);");
	}

	arduino.forBlock.leaphy_spark_led = (block) => {
		setupTCA9354();

		const red = arduino.valueToCode(block, "RED", arduino.ORDER_ATOMIC) || "0";
		const green =
			arduino.valueToCode(block, "GREEN", arduino.ORDER_ATOMIC) || "0";
		const blue =
			arduino.valueToCode(block, "BLUE", arduino.ORDER_ATOMIC) || "0";

		arduino.addSetup(
			"spark-led",
			"sparkGPIO.config(0, TCA9534::Config::OUT);\n" +
				"sparkGPIO.config(1, TCA9534::Config::OUT);\n" +
				"sparkGPIO.config(2, TCA9534::Config::OUT);",
		);

		const debug = arduino.createDebug("rgb-led", {
			type: "rgb",
			values: 3,
			name: "Leaphy Spark RGB",
		});

		return `sparkGPIO.output(2, ${debug(`(${red}) ? 255 : 0`, 0)});
sparkGPIO.output(1, ${debug(`(${green}) ? 255 : 0`, 1)});
sparkGPIO.output(0, ${debug(`(${blue}) ? 255 : 0`, 2)});`;
	};

	arduino.forBlock.leaphy_spark_read = (block) => {
		interface SensorConfig {
			pin: number;
			name: string;
			type: "digital" | "analog";
		}
		const spark_sensor_config: Record<string, SensorConfig> = {
			left_line_sensor: {
				name: "Spark left line sensor",
				type: "digital",
				pin: 3,
			},
			right_line_sensor: {
				name: "Spark right line sensor",
				type: "digital",
				pin: 4,
			},
			button_1: { name: "Spark button 1", type: "digital", pin: 7 },
			button_2: { name: "Spark button 2", type: "digital", pin: 6 },
			button_3: { name: "Spark button 3", type: "digital", pin: 5 },
			left_ambient: {
				name: "Spark left ambient light",
				type: "analog",
				pin: 1,
			},
			right_ambient: {
				name: "Spark right ambient light",
				type: "analog",
				pin: 0,
			},
			potentiometer: { name: "Spark potentiometer", type: "analog", pin: 2 },
		};

		const sensorType = block.getFieldValue("SPARK_SENSOR");
		const sensor = spark_sensor_config[sensorType];
		const debug = arduino.createDebug(`spark-${sensorType}`, {
			type: "basic",
			name: sensor.name,
			values: 1,
			simulation: sensorType,
		});

		if (sensor.type === "digital") {
			setupTCA9354();
			arduino.addSetup(
				`spark-${sensorType}`,
				`sparkGPIO.config(${sensor.pin}, TCA9534::Config::IN);`,
			);

			return [
				debug(`(sparkGPIO.input(${sensor.pin}) ? 1 : 0)`),
				arduino.ORDER_ATOMIC,
			];
		}

		if (sensor.type === "analog") {
			arduino.addDependency(Dependencies.ADS1X15_ADS);
			arduino.addInclude("ADS1X15", "#include <Adafruit_ADS1X15.h>");
			arduino.addDefinition("spark-analog", "Adafruit_ADS1115 ads;\n");
			arduino.addSetup(
				"spark-analog",
				"  if (!ads.begin(0x48)) {\n" +
					'    Serial.println("Check Connections. No Spark Analog detected.");\n' +
					"  }",
			);

			return [
				debug(`ads.readADC_SingleEnded(${sensor.pin})`),
				arduino.ORDER_ATOMIC,
			];
		}

		return ["0", arduino.ORDER_ATOMIC];
	};
}
