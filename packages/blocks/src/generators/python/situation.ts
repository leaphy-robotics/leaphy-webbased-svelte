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
		const delayMilis = Number.parseInt(
			generator.valueToCode(block, "DELAY_TIME_MILI", Order.ATOMIC),
		);
		if (delayMilis % 1000 === 0) {
			//Whole seconds.
			const delaySeconds = delayMilis / 1000;
			generator.addImport("utime", "sleep");
			return `sleep(${delaySeconds})\n`;
		}
		//whole mililseconds.
		generator.addImport("utime", "sleep_ms");
		return `sleep_ms(${delayMilis})\n`;
	};

	//The default python generator does not innately support infinite loops, surprisingly.
	python.forBlock.controls_repeat_forever = (block, generator) => {
		const branch = generator.statementToCode(block, "DO");
		const code = `while True:\n${branch}`;
		return code;
	};
}

export default getCodeGenerators;
