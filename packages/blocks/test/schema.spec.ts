import { WireColor } from "@leaphy-robotics/schemas";
import * as blocklyBlocks from "blockly/blocks";
import * as Blockly from "blockly/core";
import { beforeEach, describe, expect, it } from "vitest";
import { blocks } from "../src/blocks";
import registerExtensions from "../src/extensions";
import { PinMapping, PinSelectorField } from "../src/fields/pinSelector";
import arduino from "../src/generators/arduino";
import translations from "../src/msg/translations";
import "@blockly/field-bitmap";

const { BLACK, ORANGE, RED, WHITE, YELLOW } = WireColor;

Blockly.setLocale(translations.en);
PinSelectorField.processPinMappings(PinMapping.UNIFIED);
Blockly.fieldRegistry.register("field_pin_selector", PinSelectorField);
registerExtensions(Blockly);
Blockly.common.defineBlocksWithJsonArray(Object.values(blocklyBlocks));
Blockly.common.defineBlocksWithJsonArray(blocks);

describe("circuit schema", () => {
	let workspace: Blockly.Workspace;
	let stack: Blockly.Connection;

	const add = (type: string, fields: Record<string, string> = {}) => {
		const block = workspace.newBlock(type);
		block.initModel();
		for (const [field, value] of Object.entries(fields)) {
			block.setFieldValue(value, field);
		}

		if (block.previousConnection) {
			stack.connect(block.previousConnection);
			stack = block.nextConnection as Blockly.Connection;
			return block;
		}

		const print = workspace.newBlock("leaphy_serial_print_line");
		print
			.getInput("VALUE")
			?.connection?.connect(block.outputConnection as Blockly.Connection);
		stack.connect(print.previousConnection as Blockly.Connection);
		stack = print.nextConnection as Blockly.Connection;
		return block;
	};

	/** The color of the wire on every port of the given component */
	const wires = (component: string) => {
		arduino.workspaceToCode(workspace);

		const result: Record<string, string> = {};
		for (const wire of arduino.builder?.wires ?? []) {
			if (wire.componentA === component) result[wire.portA] = wire.color;
			if (wire.componentB === component) result[wire.portB] = wire.color;
		}
		return result;
	};

	beforeEach(() => {
		arduino.boardType = "l_nano";
		workspace = new Blockly.Workspace();
		stack = workspace.newBlock("leaphy_start").getInput("STACK")
			?.connection as Blockly.Connection;
	});

	it("powers the LED of a digital write from the rail and sinks it into the pin", () => {
		add("leaphy_io_digitalwrite", { PIN: "13" });
		arduino.workspaceToCode(workspace);

		expect(arduino.builder?.wires).toMatchObject([
			{
				componentA: "murphy",
				portA: "13",
				componentB: "led-13",
				portB: "GND",
				color: BLACK,
			},
			{
				componentA: "murphy",
				portA: "13.3V3",
				componentB: "led-13",
				portB: "VCC",
				color: RED,
			},
		]);
	});

	it("doesn't draw wires twice when a pin is written multiple times", () => {
		add("leaphy_io_digitalwrite", { PIN: "13" });
		add("leaphy_io_digitalwrite", { PIN: "13" });
		arduino.workspaceToCode(workspace);

		expect(arduino.builder?.wires).toHaveLength(2);
	});

	it.each([
		["leaphy_i2c_gesture", "gesture-null"],
		["leaphy_tmp102_read_temperature", "temperature-null"],
		["leaphy_tof_get_distance", "tof-null"],
		["leaphy_gas_sensor", "gas-null"],
	])("uses the 4 pin cable for %s", (type, component) => {
		add(type);

		expect(wires(component)).toEqual({
			SDA: ORANGE,
			SCL: WHITE,
			VCC: RED,
			GND: BLACK,
		});
	});

	it("anchors the 4 pin cable on GND for the ultrasonic sensor", () => {
		add("leaphy_sonar_read");

		expect(wires("ultrasonic-17-16")).toEqual({
			VCC: ORANGE,
			TRIG: WHITE,
			ECHO: RED,
			GND: BLACK,
		});
	});

	it("keeps the 3 pin cable in order with yellow on the signal", () => {
		add("digital_read", { PIN: "2" });
		add("analog_read", { PIN: "A0" });
		add("leaphy_servo_write", { SERVO_PIN: "3" });

		const threePin = (signal: string, vcc: string, gnd: string) => ({
			[signal]: YELLOW,
			[vcc]: BLACK,
			[gnd]: RED,
		});
		expect(wires("digital-2")).toEqual(threePin("Out", "3V3", "GND"));
		expect(wires("analog-A0")).toEqual(threePin("Out", "VCC", "GND"));
		expect(wires("servo-3")).toEqual(threePin("pulse", "vcc", "gnd"));
	});
});
