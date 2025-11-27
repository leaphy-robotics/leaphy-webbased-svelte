import { Msg } from "blockly/core";
import { Order } from "blockly/python";
import type { MicroPythonGenerator } from "../python";

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

		let trigger = block.getFieldValue("TRIG_PIN") || "A3";
		if (trigger === "DEFAULT") {
			trigger = "A3";
		}

		let echo = block.getFieldValue("ECHO_PIN") || "A2";
		if (echo === "DEFAULT") {
			echo = "A2";
		}

		return [`read_distance("${trigger}","${echo}")`, Order.FUNCTION_CALL];
	};

	python.forBlock.analog_read = (block, generator) => {
		const pin = block.getFieldValue("PIN") || "A0";

		if (generator.reserveAnalogPin(pin, true)) {
			return [`adc_${pin.toLowerCase()}.read_u16()`, Order.FUNCTION_CALL];
		}
		return null;
	};

	python.forBlock.digital_read = (block, generator) => {
		const pin = block.getFieldValue("PIN") || "D2";

		if (generator.reserveDigitalPin(pin, true)) {
			block.setWarningText(null);
			return [`pin_${pin.toLowerCase()}.value()`, Order.FUNCTION_CALL];
		}
		block.setWarningText(
			Msg.MIPY_PIN_WARN_DIGITAL_READ.replaceAll("%1", pin).replace(
				"%2",
				generator.pin_state(pin).toString(),
			),
		);
		return null;
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

	python.forBlock.leaphy_i2c_gesture = (block, generator) => {
		const active_channel = generator.currentI2cChannel() || "BC";
		const variable_name = generator.getVariableName(`ADPS_${active_channel}`);
		generator.addI2cSupport(false);
		generator.addImport("leaphymicropython.sensors.adps9960", "ADPS_9960");
		generator.addImport("leaphymicropython.sensors.adps9960", "GESTURE_NONE");
		generator.addDefinition(
			`channel${active_channel}obj`,
			`${variable_name} = ADPS(${active_channel !== "BC" ? `channel = ${active_channel}` : ""})\n${variable_name}.begin()`,
		);
		generator.addDefinition(
			`channel${active_channel}gesturebuffer`,
			`last_gesture_${active_channel} = GESTURE_NONE`,
		);
		generator.addDefinition(
			`channel${active_channel}gesture`,
			`def gesture_${active_channel}():\n  if ${variable_name}.gesture_available():\n    last_gesture_${active_channel} = ${variable_name}.read_gesture()\n  return last_gesture_${active_channel}\n`,
		);
		return [`gesture_${active_channel}()`, Order.ATOMIC];
	};

	python.forBlock.leaphy_i2c_rgb_color = (block, generator) => {
		const active_channel = generator.currentI2cChannel() || "BC";
		const variable_name = generator.getVariableName(`ADPS_${active_channel}`);
		const color_type = block.getFieldValue("COLOR_TYPE");
		generator.addI2cSupport(false);
		generator.addImport("leaphymicropython.sensors.adps9960", "ADPS_9960");
		generator.addDefinition(
			`channel${active_channel}obj`,
			`${variable_name} = ADPS(${active_channel !== "BC" ? `channel = ${active_channel}` : ""})\n${variable_name}.begin()`,
		);
		generator.addDefinition(
			`channel${active_channel}colorbuffer`,
			`last_color_${active_channel} = (0, 0, 0, 0)`,
		);
		generator.addDefinition(
			`channel${active_channel}color`,
			`def color_${active_channel}(channel):\n  if ${variable_name}.color_available():\n    last_color_${active_channel} = ${variable_name}.read_color()\n  return last_color_${active_channel}[channel]`,
		);
		return [`color_${active_channel}(${color_type})`, Order.ATOMIC];
	};
}

export default getCodeGenerators;
