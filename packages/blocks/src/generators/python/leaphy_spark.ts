import { Order } from "blockly/python";
import type { MicroPythonGenerator } from "../python";
import { spark_sensor_config } from "../utils";

export default function getCodeGenerators(python: MicroPythonGenerator) {
	function setupBooleanMultiplexer() {
		python.addImport("leaphymicropython.utils.tca9354", "Tca9354");
		python.addDefinition(
			"Spark tca9354",
			"#Configure the first 3 channels as output for the LEDs, the remaining channels as input.\nsparkGPIO = Tca9354(io_config = 0b00000111)\nsparkGPIO.begin()",
		);
		//create the thingamajig, make sure to pass the right config
	}

	python.forBlock.leaphy_spark_led = (block) => {
		setupBooleanMultiplexer();

		const red = python.valueToCode(block, "RED", Order.ATOMIC);
		const green = python.valueToCode(block, "GREEN", Order.ATOMIC);
		const blue = python.valueToCode(block, "BLUE", Order.ATOMIC);

		return `sparkGPIO.write_pin(2,${red})\nsparkGPIO.write_pin(1,${green})\nsparkGPIO.write_pin(0,${blue})\n`;
	};

	python.forBlock.leaphy_spark_read = (block) => {
		const sensorType = block.getFieldValue("SPARK_SENSOR");
		const sensor = spark_sensor_config[sensorType];

		if (sensor.type === "digital") {
			setupBooleanMultiplexer();
			return [`(1 if sparkGPIO.read_pin(${sensor.pin}) else 0)`, Order.ATOMIC];
		}

		if (sensor.type === "analog") {
			python.addImport("leaphymicropython.sensors.ads1115", "Ads1115");
			python.addDefinition("Spark adc1115", "ads = Ads1115()");
			return [`ads.readADC_single_ended(${sensor.pin})`, Order.ATOMIC];
		}

		return ["0", Order.ATOMIC];
	};
}
