import * as Blockly from "blockly/core";
import type { Arduino } from "../arduino";

function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.controls_repeat = (block) => {
		const repeats = Number(block.getFieldValue("TIMES"));
		let branch = arduino.statementToCode(block, "DO");
		branch = arduino.addLoopTrap(branch, block);
		const loopVar = arduino.nameDB_?.getDistinctName(
			"count",
			Blockly.Names.NameType.VARIABLE,
		);
		return `for (int ${loopVar} = 0; ${loopVar} < ${repeats}; ${loopVar}++) {\n${branch}}\n`;
	};

	arduino.forBlock.controls_repeat_ext = (block) => {
		const repeats =
			arduino.valueToCode(block, "TIMES", arduino.ORDER_ADDITIVE) || "0";
		let branch = arduino.statementToCode(block, "DO");
		branch = arduino.addLoopTrap(branch, block);
		let code = "";
		const loopVar = arduino.nameDB_?.getDistinctName(
			"count",
			Blockly.Names.NameType.VARIABLE,
		);
		let endVar = repeats;
		if (!repeats.match(/^\w+$/) && !Blockly.utils.string.isNumber(repeats)) {
			endVar =
				arduino.nameDB_?.getDistinctName(
					"repeat_end",
					Blockly.Names.NameType.VARIABLE,
				) || repeats;
			code += `int ${endVar} = ${repeats};\n`;
		}
		code += `for (int ${loopVar} = 0; ${loopVar} < ${endVar}; ${loopVar}++) {\n${branch}}\n`;
		return code;
	};

	arduino.forBlock.controls_repeat_forever = (block) => {
		let branch = arduino.statementToCode(block, "DO");
		branch = arduino.addLoopTrap(branch, block);
		return `while (true) {\n${branch}}\n`;
	};

	arduino.forBlock.controls_whileUntil = (block) => {
		// Do while/until loop.
		const until = block.getFieldValue("MODE") === "UNTIL";
		let argument0 =
			arduino.valueToCode(
				block,
				"BOOL",
				until ? arduino.ORDER_LOGICAL_OR : arduino.ORDER_NONE,
			) || "false";
		let branch = arduino.statementToCode(block, "DO");
		branch = arduino.addLoopTrap(branch, block);
		if (until) {
			if (!argument0.match(/^\w+$/)) {
				argument0 = `(${argument0})`;
			}
			argument0 = `!${argument0}`;
		}
		return `while (${argument0}) {\n${branch}}\n`;
	};

	arduino.forBlock.controls_for = (block) => {
		const variable0 = arduino.nameDB_?.getName(
			block.getFieldValue("VAR"),
			Blockly.Names.NameType.VARIABLE,
		);
		const argument0 =
			arduino.valueToCode(block, "FROM", arduino.ORDER_ASSIGNMENT) || "0";
		const argument1 =
			arduino.valueToCode(block, "TO", arduino.ORDER_ASSIGNMENT) || "0";
		const increment =
			arduino.valueToCode(block, "BY", arduino.ORDER_ASSIGNMENT) || "1";
		let branch = arduino.statementToCode(block, "DO");
		branch = arduino.addLoopTrap(branch, block);
		let code: string;
		if (
			Blockly.utils.string.isNumber(argument0) &&
			Blockly.utils.string.isNumber(argument1) &&
			Blockly.utils.string.isNumber(increment)
		) {
			// All arguments are simple numbers.
			const up = Number.parseFloat(argument0) <= Number.parseFloat(argument1);
			code = `for (${variable0} = ${argument0}; ${variable0}${up ? " <= " : " >= "}${argument1}; ${variable0}`;
			const step = Math.abs(Number.parseFloat(increment));
			if (step === 1) {
				code += up ? "++" : "--";
			} else {
				code += (up ? " += " : " -= ") + step;
			}
			code += `) {\n${branch}}\n`;
		} else {
			code = "";
			// Cache non-trivial values to variables to prevent repeated look-ups.
			let startVar = argument0;
			if (
				!argument0.match(/^\w+$/) &&
				!Blockly.utils.string.isNumber(argument0)
			) {
				startVar =
					arduino.nameDB_?.getDistinctName(
						`${variable0}_start`,
						Blockly.Names.NameType.VARIABLE,
					) || argument0;
				code += `int ${startVar} = ${argument0};\n`;
			}
			let endVar = argument1;
			if (
				!argument1.match(/^\w+$/) &&
				!Blockly.utils.string.isNumber(argument1)
			) {
				endVar =
					arduino.nameDB_?.getDistinctName(
						`${variable0}_end`,
						Blockly.Names.NameType.VARIABLE,
					) || argument1;
				code += `int ${endVar} = ${argument1};\n`;
			}
			// Determine loop direction at start, in case one of the bounds
			// changes during loop execution.
			const incVar = arduino.nameDB_?.getDistinctName(
				`${variable0}_inc`,
				Blockly.Names.NameType.VARIABLE,
			);
			code += `int ${incVar} = `;
			if (Blockly.utils.string.isNumber(increment)) {
				code += `${Math.abs(Number(increment))};\n`;
			} else {
				code += `abs(${increment});\n`;
			}
			code += `if (${startVar} > ${endVar}) {\n`;
			code += `${arduino.INDENT + incVar} = -${incVar};\n`;
			code += "}\n";
			code += `for (${variable0} = ${startVar};\n     ${incVar} >= 0 ? ${variable0} <= ${endVar} : ${variable0} >= ${endVar};\n     ${variable0} += ${incVar}) {\n${branch}}\n`;
		}
		return code;
	};

	arduino.forBlock.controls_flow_statements = (block) => {
		switch (block.getFieldValue("FLOW")) {
			case "BREAK":
				return "break;\n";
			case "CONTINUE":
				return "continue;\n";
		}
		throw "Unknown flow statement.";
	};
}

export default getCodeGenerators;
