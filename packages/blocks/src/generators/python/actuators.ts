import { Order } from "blockly/python";
import type { MicroPythonGenerator } from "../python";

/**
 * Block definitions for the BKY_ACTUATOREN_CATEGORY toolbox-category.
 * Contains instructions for output-peripherals, such as serial lines and motors.
 */

function getCodeGenerators(python: MicroPythonGenerator) {
	python.forBlock.leaphy_serial_print_line = (block, generator) => {
		const text = generator.valueToCode(block, "VALUE", Order.ATOMIC) || "None";
		return `print(${text})\n`;
	};

	python.forBlock.leaphy_io_digitalwrite = (block, generator) => {
		generator.addImport("leaphymicropython.utils.pins", "set_pin");

		const pin = block.getFieldValue("PIN") || "0";
		const value = generator.valueToCode(block, "STATE", Order.ATOMIC);

		return `set_pin(${pin}, ${value})\n`;
	};

	python.forBlock.leaphy_io_analogwrite = (block, generator) => {
		generator.addImport("leaphymicropython.utils.pins", "set_pwm");

		const pin = block.getFieldValue("PIN") || "0";
		const value = generator.valueToCode(block, "NUM", Order.ATOMIC);

		return `set_pwm(${pin}, ${value})\n`;
	};
}

export default getCodeGenerators;
