import {
	LightSensor,
	LineSensor,
	RGBFlitz,
	WireColor,
} from "@leaphy-robotics/schemas/src";
import Servo from "@leaphy-robotics/schemas/src/components/servo";
import type { Block } from "blockly/core";
import { MotorDirection } from "../../blocks/leaphy_original";
import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";

function getCodeGenerators(arduino: Arduino) {
	function setupStarlingServos(block: Block) {
		arduino.includeServoHeader();
		arduino.addDeclaration("servo_left", "Servo servo_left;");
		arduino.addDeclaration("servo_right", "Servo servo_right;");
		arduino.addSetup("servo_left", "servo_left.attach(12);", false);
		arduino.addSetup("servo_right", "servo_right.attach(13);", false);
		arduino.reservePin(block, "12", arduino.PinTypes.SERVO, "Servo Set");
		arduino.reservePin(block, "13", arduino.PinTypes.SERVO, "Servo Set");

		const servoLeft = arduino.builder.add("servo_left", Servo);
		arduino.builder.connect(
			arduino.murphy.port("D12"),
			servoLeft.port("pulse"),
			WireColor.DATA_1,
		);
		arduino.builder.connect(
			arduino.murphy.port("D12.3V3"),
			servoLeft.port("vcc"),
			WireColor.VCC,
		);
		arduino.builder.connect(
			arduino.murphy.port("D12.GND"),
			servoLeft.port("gnd"),
			WireColor.GND,
		);

		const servoRight = arduino.builder.add("servo_right", Servo);
		arduino.builder.connect(
			arduino.murphy.port("D13"),
			servoRight.port("pulse"),
			WireColor.DATA_1,
		);
		arduino.builder.connect(
			arduino.murphy.port("D13.3V3"),
			servoRight.port("vcc"),
			WireColor.VCC,
		);
		arduino.builder.connect(
			arduino.murphy.port("D13.GND"),
			servoRight.port("gnd"),
			WireColor.GND,
		);
	}

	arduino.forBlock.leaphy_original_set_led = (block) => {
		const red =
			arduino.valueToCode(block, "LED_RED", arduino.ORDER_ATOMIC) || "0";
		const green =
			arduino.valueToCode(block, "LED_GREEN", arduino.ORDER_ATOMIC) || "0";
		const blue =
			arduino.valueToCode(block, "LED_BLUE", arduino.ORDER_ATOMIC) || "0";

		let pin_red: number;
		let pin_blue: number;
		let pin_green: number;
		if (arduino.boardType.includes("nano")) {
			const led = arduino.builder.add("rgb", RGBFlitz);

			// Use different pins for the original nano since they conflict with the motors
			if (arduino.robotType.includes("original")) {
				pin_red = 5;
				pin_green = 6;
				pin_blue = 7;
			} else {
				pin_red = 11;
				pin_green = 10;
				pin_blue = 9;
			}

			arduino.builder.connect(
				arduino.murphy.port(pin_red.toString()),
				led.port("R"),
				WireColor.DATA_1,
			);
			arduino.builder.connect(
				arduino.murphy.port(pin_green.toString()),
				led.port("G"),
				WireColor.DATA_2,
			);
			arduino.builder.connect(
				arduino.murphy.port(pin_blue.toString()),
				led.port("B"),
				WireColor.DATA_3,
			);
			arduino.builder.connect(
				arduino.murphy.port("D8"),
				led.port("GND"),
				WireColor.GND,
			);

			// Ground is connected to pin 8 on the nano, so it needs to be pulled LOW
			arduino.addSetup(
				"setup_nano_rgb",
				"pinMode(8, OUTPUT);\n  digitalWrite(8, LOW);",
				false,
			);
		} else {
			pin_red = 6;
			pin_green = 5;
			pin_blue = 3;
		}

		return (
			`analogWrite(${pin_red}, ${red});\n` +
			`analogWrite(${pin_green}, ${green});\n` +
			`analogWrite(${pin_blue}, ${blue});\n`
		);
	};

	arduino.forBlock.leaphy_original_set_motor = (block) => {
		const dropdown_Type = block.getFieldValue("MOTOR_TYPE");
		let speed =
			arduino.valueToCode(block, "MOTOR_SPEED", arduino.ORDER_ATOMIC) || "100";

		arduino.addDependency(Dependencies.LEAPHY_EXTENSIONS);
		arduino.addInclude(
			"include_leaphy_original",
			'#include "Leaphyoriginal1.h"',
		);
		// Set different motor pins for nano robots
		if (arduino.boardType.includes("nano")) {
			if (Number.parseInt(speed) > 0) {
				// Map the speed to a range of 100 - 255 to compensate for low PWM signal voltage
				speed = `map(${speed}, 0, 255, 100, 255)`;
			}
			arduino.addSetup("set_motor_pins", "setMotorPins(3, 2, 11, 4);", true);
		}

		return `setMotor(${dropdown_Type}, ${speed});\n`;
	};

	arduino.forBlock.leaphy_click_set_motor =
		arduino.forBlock.leaphy_original_set_motor;

	arduino.forBlock.leaphy_original_move_motors = (block) => {
		let direction = block.getFieldValue("MOTOR_DIRECTION") as MotorDirection;
		let speed =
			arduino.valueToCode(block, "MOTOR_SPEED", arduino.ORDER_ATOMIC) || "100";

		arduino.addDependency(Dependencies.LEAPHY_EXTENSIONS);
		arduino.addInclude(
			"include_leaphy_original",
			'#include "Leaphyoriginal1.h"',
		);

		// Set different motor pins for nano robots
		if (arduino.boardType.includes("nano")) {
			// Map the speed to a range of 100 - 255 to compensate for low PWM signal voltage
			if (Number.parseInt(speed) > 0) {
				speed = `map(${speed}, 0, 255, 100, 255)`;
			}
			const directionMap: Record<MotorDirection, string> = {
				[MotorDirection.FORWARD]: "2",
				[MotorDirection.BACKWARD]: "1",
				[MotorDirection.LEFT]: "4",
				[MotorDirection.RIGHT]: "3",
			};
			direction = directionMap[direction] as MotorDirection;
			arduino.addSetup("set_motor_pins", "setMotorPins(3, 2, 11, 4);", true);
		}

		return `moveMotors(${direction}, ${speed});\n`;
	};

	arduino.forBlock.digital_read = (block) => {
		const dropdown_pin = arduino.getPinMapping(block, "PIN");

		const sensor = arduino.builder.add(`digital-${dropdown_pin}`, LineSensor);
		arduino.builder.connect(
			arduino.murphy.port(dropdown_pin),
			sensor.port("Out"),
			WireColor.DATA_1,
		);
		arduino.builder.connect(
			arduino.murphy.port(`${dropdown_pin}.3V3`),
			sensor.port("3V3"),
			WireColor.VCC,
		);
		arduino.builder.connect(
			arduino.murphy.port(`${dropdown_pin}.GND`),
			sensor.port("GND"),
			WireColor.GND,
		);

		arduino.setups_[`setup_input_${dropdown_pin}`] =
			`pinMode(${dropdown_pin}, INPUT);`;
		const code = `digitalRead(${dropdown_pin})`;
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.analog_read = (block) => {
		const dropdown_pin = arduino.getPinMapping(block, "PIN");

		const lightSensor = arduino.builder.add(
			`analog-${dropdown_pin}`,
			LightSensor,
		);
		arduino.builder.connect(
			arduino.murphy.port(dropdown_pin),
			lightSensor.port("Out"),
			WireColor.DATA_1,
		);
		arduino.builder.connect(
			arduino.murphy.port(`${dropdown_pin}.3V3`),
			lightSensor.port("VCC"),
			WireColor.VCC,
		);
		arduino.builder.connect(
			arduino.murphy.port(`${dropdown_pin}.GND`),
			lightSensor.port("GND"),
			WireColor.GND,
		);

		const code = `analogRead(${dropdown_pin})`;
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_original_buzz = (block) => {
		arduino.addInclude("arduino", "#include <Arduino.h>");
		arduino.addSetup("tone", "pinMode(4, OUTPUT);", false);
		const frequency =
			arduino.valueToCode(block, "FREQUENCY", arduino.ORDER_ATOMIC) || "0";
		const duration =
			arduino.valueToCode(block, "DURATION", arduino.ORDER_ATOMIC) || "0";
		return `tone(4, ${frequency}, ${duration});\n`;
	};

	arduino.forBlock.leaphy_original_servo_set = (block) => {
		setupStarlingServos(block);

		const motor = block.getFieldValue("MOTOR");
		const speed =
			arduino.valueToCode(block, "SPEED", arduino.ORDER_ATOMIC) || "100";
		const direction = motor === "left" ? 1 : -1;

		return `servo_${motor}.write(90 + 90*${speed}/100*${direction});\n`;
	};

	arduino.forBlock.leaphy_original_servo_move = (block) => {
		setupStarlingServos(block);

		const MOTOR_SPEEDS: Record<string, [number, number]> = {
			forward: [1, -1],
			backward: [-1, 1],
			left: [-1, -1],
			right: [1, 1],
		};
		const direction = block.getFieldValue("DIRECTION");
		const speed =
			arduino.valueToCode(block, "SPEED", arduino.ORDER_ATOMIC) || "100";
		const motor_left = MOTOR_SPEEDS[direction][0];
		const motor_right = MOTOR_SPEEDS[direction][1];

		return (
			`servo_left.write(90 + 90*${speed}/100*${motor_left});\n` +
			`servo_right.write(90 + 90*${speed}/100*${motor_right});\n`
		);
	};
}

export default getCodeGenerators;
