import * as Blockly from "blockly/core";
import type { Arduino } from "../arduino";

function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.text = (block) => {
		const code = arduino.quote_(block.getFieldValue("TEXT"));
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.variables_get = (block) => {
		const varName = arduino.nameDB_?.getName(
			block.getFieldValue("VAR"),
			Blockly.Names.NameType.VARIABLE,
		) as string;
		return [varName, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.variables_set = (block) => {
		const argument0 =
			arduino.valueToCode(block, "VALUE", arduino.ORDER_ASSIGNMENT) || "0";
		const varName = arduino.nameDB_?.getName(
			block.getFieldValue("VAR"),
			Blockly.Names.NameType.VARIABLE,
		);

		return `${varName} = ${argument0};\n`;
	};
}

export default getCodeGenerators;
