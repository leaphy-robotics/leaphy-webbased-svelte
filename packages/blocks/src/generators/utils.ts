import type { Block, Generator } from "blockly/core";

export function statementWrapper<Type extends Generator>(
	generator: Type,
	statement: string,
	block: Block,
) {
	let branch = statement;
	if (generator.STATEMENT_SUFFIX && !block.suppressPrefixSuffix) {
		branch =
			generator.prefixLines(
				generator.injectId(generator.STATEMENT_SUFFIX, block),
				generator.INDENT,
			) + branch;
	}
	if (generator.STATEMENT_PREFIX && !block.suppressPrefixSuffix) {
		branch =
			branch +
			generator.prefixLines(
				generator.injectId(generator.STATEMENT_PREFIX, block),
				generator.INDENT,
			);
	}

	return branch;
}

export function addLoopTrap<Type extends Generator>(
	generator: Type,
	code: string,
	block: Block,
): string {
	let branch = code;
	if (generator.INFINITE_LOOP_TRAP) {
		branch =
			generator.prefixLines(
				generator.injectId(generator.INFINITE_LOOP_TRAP, block),
				generator.INDENT,
			) + branch;
	}

	return branch;
}

export interface SensorConfig {
	pin: number;
	name: string;
	type: "digital" | "analog";
}
// pin-to-peripheral mapping for the Spark board. Note that "digital" and
// "analog" are two different sets of lines; digital pin 1 != analog pin 1.
export const spark_sensor_config: Record<string, SensorConfig> = {
	left_line_sensor: {
		name: "Spark left line sensor",
		type: "digital",
		pin: 3,
	},
	right_line_sensor: {
		name: "Spark right line sensor",
		type: "digital",
		pin: 4,
	},
	button_1: { name: "Spark button 1", type: "digital", pin: 7 },
	button_2: { name: "Spark button 2", type: "digital", pin: 6 },
	button_3: { name: "Spark button 3", type: "digital", pin: 5 },
	left_ambient: {
		name: "Spark left ambient light",
		type: "analog",
		pin: 1,
	},
	right_ambient: {
		name: "Spark right ambient light",
		type: "analog",
		pin: 0,
	},
	potentiometer: { name: "Spark potentiometer", type: "analog", pin: 2 },
};
