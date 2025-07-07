import { Msg } from "blockly/core";
import { Order } from "blockly/python";
import type { MicroPythonGenerator } from "../python";

/**
 * Block definitions for the BKY_ACTUATOREN_CATEGORY toolbox-category.
 * Contains instructions for output-peripherals, such as serial lines and motors.
 */

function addOledSupport(generator: MicroPythonGenerator, i2c_channel: string) {
	generator.addI2cSupport(true);
	generator.addImport("leaphymicropython.actuators", "ssd1306");
	generator.addDefinition(
		"smalldisplaysize",
		"SMALL_OLED_WIDTH = 128\nSMALL_OLED_HEIGHT = 64",
	);
	//Note that, because the display's initialize_device function does *not* currently switch
	// channels, it's done manually here.
	generator.addDefinition(
		`channel${i2c_channel}oled`,
		`select_channel(I2C_CONNECTION, MULTIPLEXER_ADDRESS, ${i2c_channel === "BC" ? 255 : i2c_channel})\nSMALL_OLED_${i2c_channel} = ssd1306.SSD1306I2C(SMALL_OLED_WIDTH, SMALL_OLED_HEIGHT, I2C_CONNECTION)\nSMALL_OLED_${i2c_channel}.initialize_device()`,
	);
}

function getCodeGenerators(python: MicroPythonGenerator) {
	python.forBlock.leaphy_serial_print_line = (block, generator) => {
		const text = generator.valueToCode(block, "VALUE", Order.ATOMIC) || "None";
		return `print(${text})\n`;
	};

	python.forBlock.leaphy_io_digitalwrite = (block, generator) => {
		const pin = block.getFieldValue("PIN") || "D2";
		const value = generator.valueToCode(block, "STATE", Order.ATOMIC);

		if (generator.reserveDigitalPin(pin, false)) {
			block.setWarningText(null);
			return `pin_${pin.toLowerCase()}.value(${value})\n`;
		}
		block.setWarningText(
			Msg.MIPY_PIN_WARN_DIGITAL_WRITE.replaceAll("%1", pin).replace(
				"%2",
				generator.pin_state(pin).toString(),
			),
		);
		return null;
	};

	python.forBlock.leaphy_io_analogwrite = (block, generator) => {
		const pin = block.getFieldValue("PIN") || "D2";
		const value = generator.valueToCode(block, "NUM", Order.ATOMIC);

		if (generator.reserveAnalogPin(pin, false)) {
			block.setWarningText(null);
			return `pwm_${pin.toLowerCase()}.duty_u16(${value})\n`;
		}
		block.setWarningText(
			Msg.MIPY_PIN_WARN_PWM.replaceAll("%1", pin).replaceAll(
				"%2",
				generator.pin_state(pin).toString(),
			),
		);
		return null;
	};

	python.forBlock.leaphy_display_clear = (block, generator) => {
		const i2c_channel = generator.currentI2cChannel()?.toString() || "BC";

		addOledSupport(generator, i2c_channel);

		return `SMALL_OLED_${i2c_channel}.fill(0)\n`;
	};

	python.forBlock.leaphy_display_print_line = (block, generator) => {
		const i2c_channel = generator.currentI2cChannel()?.toString() || "BC";

		addOledSupport(generator, i2c_channel);

		const to_write = generator.valueToCode(block, "VALUE", Order.NONE);
		const row_no = block.getFieldValue("DISPLAY_ROW");

		return `SMALL_OLED_${i2c_channel}.text(str(${to_write}), 0, ${row_no * 8})\n`;
	};

	python.forBlock.leaphy_display_print_value = (block, generator) => {
		const i2c_channel = generator.currentI2cChannel()?.toString() || "BC";

		addOledSupport(generator, i2c_channel);

		const name_text = generator.valueToCode(block, "NAME", Order.NONE);
		const value_text = generator.valueToCode(block, "VALUE", Order.NONE);
		const to_write = `str(${name_text}) + ' = ' + str(${value_text})`;
		const row_no = block.getFieldValue("DISPLAY_ROW");

		return `SMALL_OLED_${i2c_channel}.text(${to_write}, 0, ${row_no * 8})\n`;
	};

	python.forBlock.leaphy_display_display = (block, generator) => {
		const i2c_channel = generator.currentI2cChannel()?.toString() || "BC";

		addOledSupport(generator, i2c_channel);

		return `SMALL_OLED_${i2c_channel}.show()\n`;
	};

	python.forBlock.leaphy_original_set_motor = (block, generator) => {
		const dropdown_Type = block.getFieldValue("MOTOR_TYPE");
		let speed = python.valueToCode(block, "MOTOR_SPEED", Order.NONE) || "100";

		generator.addImport("leaphymicropython.actuators.dcmotor", "DCMotor");

		let right = dropdown_Type === "10";

		let name = "left";
		let direction_pin = "D4";
		let pwm_pin = "D11";

		if (right) {
			name = "right";
			direction_pin = "D2";
			pwm_pin = "D3";
		}

		const MotorVariableName = python.getVariableName(`motor_${name}`);

		const actual_function_name = generator.provideFunction_("set_motor_speed", [
			`def ${generator.FUNCTION_NAME_PLACEHOLDER_}(motor, speed):`,
			"  if speed >= 0:",
			"    motor.forward(speed)",
			"  else:",
			"    motor.backward(-speed)",
		]);
		generator.addDefinition(
			MotorVariableName,
			`${MotorVariableName} = DCMotor(direction_pin=\"${direction_pin}\", pwn_pin=\"${pwm_pin}\")`,
		);

		return `${actual_function_name}(${MotorVariableName}, ${speed})\n`;
	};
}

export default getCodeGenerators;
