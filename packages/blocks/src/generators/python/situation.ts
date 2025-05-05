import { Order, type PythonGenerator } from "blockly/python";
import { registerImport } from "../python";

/********
 * Block definitions for the BKY_LEAPHY_SITUATION_CATEGORY toolbox-category.
 * Includes loops, conditionals and delays.
 */

function getCodeGenerators(python: PythonGenerator) {
	python.forBlock.time_delay = (block, generator) => {
		//Python's sleep expects seconds.
		const delayTime =
			Number.parseInt(
				generator.valueToCode(block, "DELAY_TIME_MILI", Order.ATOMIC) || "0",
				10,
			) / 1000;

		registerImport(generator, "time", "sleep");
		return `sleep(${delayTime})\n`;
	};

	//The default python generator does not innately support infinite loops, surprisingly.
	python.forBlock.controls_repeat_forever = (block, generator) => {
		const branch = generator.statementToCode(block, "DO");
		//biome-ignore lint: a templated string is *slightly* harder to read here; the + breaks up the line in a natural way.
		const code = "while True:\n" + branch;
		return code;
	};
}

export default getCodeGenerators;
