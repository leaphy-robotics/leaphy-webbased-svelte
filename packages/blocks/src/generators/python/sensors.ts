import { Order } from "blockly/python";
import { type MicroPythonGenerator, pin_name_aliases } from "../python";

/**
 * Block definitions for the BKY_LEAPHY_SENSORS_CATEGORY toolbox-category.
 * Includes controls for the i2c interface, and sensor readouts.
 */

function getCodeGenerators(python: MicroPythonGenerator) {
	python.forBlock.i2c_use_channel = (block, generator) => {
		const channel = block.getFieldValue("CHANNEL") || -1;
		if (channel === -1) {
			return null; //something went horribly wrong.
		}
		generator.startI2cBlock(channel);
		//In order to "smartly" insert channel switches, will have to manually
		// step through the statement and search for any blocks that access the
		// I2C interface.
		const statements = block.getInputTargetBlock("DO");
		const code = generator.blockToCode(statements, false);

		generator.endI2cBlock();
		return code;
	};

	python.forBlock.leaphy_sonar_read = (block, generator) => {
		generator.addImport("leaphymicropython.sensors.sonar", "read_distance");

		const trigger = block.getFieldValue("TRIG_PIN") || 17;
		const echo = block.getFieldValue("ECHO_PIN") || 16;

		return [`read_distance(${trigger},${echo})`, Order.FUNCTION_CALL];
	};

	python.forBlock.analog_read = (block, generator) => {
		const pin = block.getFieldValue("PIN") || "A0";

		if (generator.reserveAnalogPin(pin, true)) {
			return [`adc_${pin.toLowerCase()}.read_u16()`, Order.FUNCTION_CALL];
		}
		return [
			`"""Caution! This pin is not available as analog input. Check if any of the following pins are in use: ${pin_name_aliases(pin)?.join("/")}"""`,
			Order.NONE,
		];
	};

	python.forBlock.digital_read = (block, generator) => {
		const pin = `D${block.getFieldValue("PIN") || "0"}`;

		if (generator.reserveDigitalPin(pin, true)) {
			return [`pin_${pin.toLowerCase()}.value()`, Order.FUNCTION_CALL];
		}

		return [
			`"""Caution! This pin is not available as digital input. Check if any of the following pins are in use: ${pin_name_aliases(pin)?.join("/")}"""`,
			Order.NONE,
		];
	};

	python.forBlock.leaphy_tof_get_distance = (block, generator) => {
		const active_channel = generator.currentI2cChannel() || "BC";
		const variable_name = generator.getVariableName(`TOF_${active_channel}`);
		generator.addI2cSupport(false);
		generator.addImport("leaphymicropython.sensors.tof", "TimeOfFlight");
		generator.addDefinition(
			`channel${active_channel}obj`,
			`${variable_name} = TimeOfFlight(${active_channel === "BC" ? 255 : active_channel})\n${variable_name}.initialize_device()`,
		);

		generator.i2c_channel_clean_ = true;
		return [`${variable_name}.get_distance()`, Order.FUNCTION_CALL];
	};
}

export default getCodeGenerators;
