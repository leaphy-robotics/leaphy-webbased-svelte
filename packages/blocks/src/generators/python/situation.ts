import { Order } from "blockly/python";
import type { MicroPythonGenerator } from "../python";

/**
 * Block definitions for the BKY_LEAPHY_SITUATION_CATEGORY toolbox-category.
 * Includes loops, conditionals and delays.
 */

function getCodeGenerators(python: MicroPythonGenerator) {
	python.forBlock.time_delay = (block, generator) => {
		//Micropython recommends the utime module instead of the default time-keeping module.
		//Said module offers both a sleep(seconds) function and a sleep_ms(ms) function, along
		//with a warning that some Micropython ports "may not accept [a] floating point argument
		// [for the sleep function.]"

		const delay = generator.valueToCode(block, "DELAY_TIME_MILI", Order.NONE);

		generator.addImport("utime", "sleep_ms");

		return `sleep_ms(${delay})\n`;
	};

	//The default python generator does not innately support infinite loops, surprisingly.
	python.forBlock.controls_repeat_forever = (block, generator) => {
		let branch = generator.statementToCode(block, "DO");
		if (branch === "") {
			branch = generator.PASS;
		}
		const code = `while True:\n${branch}`;
		return code;
	};

	python.forBlock.controls_if = (block, generator) => {
		// If/elseif/else condition.
		let n = 0;
		let code = '',
			branchCode,
			conditionCode;
		do {
			conditionCode =
				generator.valueToCode(block, 'IF' + n, Order.NONE) || 'False';
			branchCode = generator.statementToCode(block, 'DO' + n) || generator.PASS;
			code += (n === 0 ? 'if ' : 'elif ') + conditionCode + ':\n' + branchCode;
			n++;
		} while (block.getInput('IF' + n));

		if (block.getInput('ELSE')) {
			if (block.getInput('ELSE')) {
				branchCode = generator.statementToCode(block, 'ELSE') || generator.PASS;
			} else {
				branchCode = generator.PASS;
			}

			code += 'else:\n' + branchCode;
		}
		return code;
	}

	python.forBlock.controls_if_else = python.forBlock.controls_if;

	python.forBlock.raw_code_line = (block, generator) => {
		const code = block.getFieldValue("CODE_INPUT");
		return `${code}\n`;
	};
}

export default getCodeGenerators;
