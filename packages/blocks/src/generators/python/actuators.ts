import { Msg } from "blockly/core";
import { Order } from "blockly/python";
import { MotorDirection } from "../../blocks/leaphy_original";
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

	function getSetMotorSpeedName(generator: MicroPythonGenerator): string {
		const SetMotorSpeedName = generator.provideFunction_("set_motor_speed", [
			`def ${generator.FUNCTION_NAME_PLACEHOLDER_}(motor, speed):`,
			"  if speed >= 0:",
			"    motor.forward(speed)",
			"  else:",
			"    motor.backward(-speed)",
		]);

		return SetMotorSpeedName;
	}

	function getDCMotorName(
		generator: MicroPythonGenerator,
		right: boolean,
	): string {
		let name = right ? "right" : "left";
		let direction_pin = right ? "D2" : "D4";
		let pwm_pin = right ? "D3" : "D11";

		generator.addImport("leaphymicropython.actuators.dcmotor", "DCMotor");

		const MotorVariableName = python.getVariableName(`dc_motor_${name}`);

		generator.addDefinition(
			MotorVariableName,
			`${MotorVariableName} = DCMotor(direction_pin=\"${direction_pin}\", pwm_pin=\"${pwm_pin}\")`,
		);

		return MotorVariableName;
	}

	function getDCMotorsName(generator: MicroPythonGenerator): string {
		generator.addImport("leaphymicropython.actuators.dcmotor", "DCMotors");

		const MotorsVariableName = python.getVariableName("dc_motors");

		generator.addDefinition(
			MotorsVariableName,
			`${MotorsVariableName} = DCMotors()`,
		);

		return MotorsVariableName;
	}

	python.forBlock.leaphy_original_set_motor = (block, generator) => {
		const dropdown_Type = block.getFieldValue("MOTOR_TYPE");
		let speed = python.valueToCode(block, "MOTOR_SPEED", Order.NONE) || "100";

		let MotorVariableName = getDCMotorName(generator, dropdown_Type === "10");

		return `${getSetMotorSpeedName(generator)}(${MotorVariableName}, ${speed})\n`;
	};

	python.forBlock.leaphy_original_move_motors = (block, generator) => {
		let direction = block.getFieldValue("MOTOR_DIRECTION") as MotorDirection;
		const speedCode =
			generator.valueToCode(block, "MOTOR_SPEED", Order.NONE) || "100";

		let MotorsName = getDCMotorsName(generator);

		switch (direction) {
			case MotorDirection.FORWARD:
				return `${MotorsName}.steer("forward", ${speedCode}, 0)\n`;
			case MotorDirection.BACKWARD:
				return `${MotorsName}.steer("backward", ${speedCode}, 0)\n`;
			case MotorDirection.LEFT:
				return `${MotorsName}.steer("left", ${speedCode}, 1)\n`;
			case MotorDirection.RIGHT:
				return `${MotorsName}.steer("right", ${speedCode}, 1)\n`;
		}
	};

	python.forBlock.leaphy_original_servo_set = (block, generator) => {
		const motor = block.getFieldValue("MOTOR");
		const speed =
			generator.valueToCode(block, "SPEED", Order.MULTIPLICATIVE) || "100";
		const direction = motor === "left" ? 1 : -1;

		generator.addImport("leaphymicropython.actuators.servo", "set_servo_angle");

		const pin = motor === "left" ? "D12" : "D13";

		return `set_servo_angle("${pin}", 90 + 90*${speed}/100*${direction})\n`;
	};

	python.forBlock.leaphy_original_servo_move = (block, generator) => {
		const MOTOR_SPEEDS: Record<string, [number, number]> = {
			forward: [1, -1],
			backward: [-1, 1],
			left: [-1, -1],
			right: [1, 1],
		};
		const direction = block.getFieldValue("DIRECTION");
		const speed = generator.valueToCode(block, "SPEED", Order.NONE) || "100";
		const motor_left = MOTOR_SPEEDS[direction][0];
		const motor_right = MOTOR_SPEEDS[direction][1];

		generator.addImport("leaphymicropython.actuators.servo", "set_servo_angle");

		const servoSpeedVar = generator.getVariableName("servo_speed");
		return (
			`${servoSpeedVar} = ${speed}\n` +
			`set_servo_angle("D12", 90 + 90*${servoSpeedVar}/100*${motor_left})\n` +
			`set_servo_angle("D13", 90 + 90*${servoSpeedVar}/100*${motor_right})\n`
		);
	};
}

export default getCodeGenerators;
