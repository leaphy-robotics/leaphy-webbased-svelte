import { Order } from "blockly/python";
import type { MicroPythonGenerator } from "../python";

/**
 * Block definitions for the BKY_ACTUATOREN_CATEGORY toolbox-category.
 * Contains instructions for output-peripherals, such as serial lines and motors.
 */

function getCodeGenerators(python:MicroPythonGenerator) {
    python.forBlock.leaphy_serial_print_line = (block,generator) => {
        const text = generator.valueToCode(block,"VALUE",Order.ATOMIC) || "None";
        return `print(${text})\n`;
    }
};

export default getCodeGenerators;