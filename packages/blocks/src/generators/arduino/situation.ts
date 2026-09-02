import * as Blockly from "blockly/core";
import type { Arduino } from "../arduino";

export default function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.time_delay = (block) => {
		const delayTime =
			arduino.valueToCode(block, "DELAY_TIME_MILI", arduino.ORDER_ATOMIC) ||
			"0";

		switch (block.getFieldValue("UNIT")) {
			case "ms":
				return `delay(${delayTime});\n`;
			case "s":
				return `delay(${delayTime} * 1000);\n`;
			default:
				return `delayMicroseconds(${delayTime});\n`;
		}
	};

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

	arduino.forBlock.controls_if = (block) => {
		let n = 0;
		let argument =
			arduino.valueToCode(block, `IF${n}`, arduino.ORDER_NONE) || "false";
		let branch = arduino.statementToCode(block, `DO${n}`);
		let code = `if (${argument}) {\n${branch}}`;

		const blockProps = block as unknown as Record<string, number>;
		for (n = 1; n <= blockProps.elseifCount_; n++) {
			argument =
				arduino.valueToCode(block, `IF${n}`, arduino.ORDER_NONE) || "false";
			branch = arduino.statementToCode(block, `DO${n}`);
			code += ` else if (${argument}) {\n${branch}}`;
		}
		if (blockProps.elseCount_) {
			branch = arduino.statementToCode(block, "ELSE");
			code += ` else {\n${branch}}`;
		}
		return `${code}\n`;
	};

	arduino.forBlock.controls_whileUntil = (block) => {
		const until = block.getFieldValue("MODE") === "UNTIL";
		let argument =
			arduino.valueToCode(
				block,
				"BOOL",
				until ? arduino.ORDER_LOGICAL_OR : arduino.ORDER_NONE,
			) || "false";
		let branch = arduino.statementToCode(block, "DO");
		branch = arduino.addLoopTrap(branch, block);
		if (until) {
			if (!argument.match(/^\w+$/)) argument = `(${argument})`;
			argument = `!${argument}`;
		}
		return `while (${argument}) {\n${branch}}\n`;
	};

	arduino.forBlock.controls_for = (block) => {
		const variable = arduino.nameDB_?.getName(
			block.getFieldValue("VAR"),
			Blockly.Names.NameType.VARIABLE,
		);
		const from =
			arduino.valueToCode(block, "FROM", arduino.ORDER_ASSIGNMENT) || "0";
		const to =
			arduino.valueToCode(block, "TO", arduino.ORDER_ASSIGNMENT) || "0";
		const increment =
			arduino.valueToCode(block, "BY", arduino.ORDER_ASSIGNMENT) || "1";
		let branch = arduino.statementToCode(block, "DO");
		branch = arduino.addLoopTrap(branch, block);
		let code: string;

		if (
			Blockly.utils.string.isNumber(from) &&
			Blockly.utils.string.isNumber(to) &&
			Blockly.utils.string.isNumber(increment)
		) {
			const up = Number.parseFloat(from) <= Number.parseFloat(to);
			code = `for (${variable} = ${from}; ${variable}${up ? " <= " : " >= "}${to}; ${variable}`;
			const step = Math.abs(Number.parseFloat(increment));
			code += step === 1 ? (up ? "++" : "--") : (up ? " += " : " -= ") + step;
			code += `) {\n${branch}}\n`;
		} else {
			code = "";
			let startVar = from;
			if (!from.match(/^\w+$/) && !Blockly.utils.string.isNumber(from)) {
				startVar =
					arduino.nameDB_?.getDistinctName(
						`${variable}_start`,
						Blockly.Names.NameType.VARIABLE,
					) || from;
				code += `int ${startVar} = ${from};\n`;
			}
			let endVar = to;
			if (!to.match(/^\w+$/) && !Blockly.utils.string.isNumber(to)) {
				endVar =
					arduino.nameDB_?.getDistinctName(
						`${variable}_end`,
						Blockly.Names.NameType.VARIABLE,
					) || to;
				code += `int ${endVar} = ${to};\n`;
			}
			const incVar = arduino.nameDB_?.getDistinctName(
				`${variable}_inc`,
				Blockly.Names.NameType.VARIABLE,
			);
			code += `int ${incVar} = `;
			code += Blockly.utils.string.isNumber(increment)
				? `${Math.abs(Number(increment))};\n`
				: `abs(${increment});\n`;
			code += `if (${startVar} > ${endVar}) {\n`;
			code += `${arduino.INDENT + incVar} = -${incVar};\n`;
			code += "}\n";
			code += `for (${variable} = ${startVar};\n     ${incVar} >= 0 ? ${variable} <= ${endVar} : ${variable} >= ${endVar};\n     ${variable} += ${incVar}) {\n${branch}}\n`;
		}
		return code;
	};

	arduino.forBlock.controls_flow_statements = (block) => {
		switch (block.getFieldValue("FLOW")) {
			case "BREAK":
				return "break;\n";
			case "CONTINUE":
				return "continue;\n";
			default:
				throw "Unknown flow statement.";
		}
	};

	arduino.forBlock.leaphy_start = (block) => {
		let branch = arduino.statementToCode(block, "STACK");
		branch = arduino.addLoopTrap(branch, block);
		const code = `void leaphyProgram() {\n${branch}}\n`;
		arduino.addSetup("userSetupCode", "leaphyProgram();", false);
		return code;
	};
}
