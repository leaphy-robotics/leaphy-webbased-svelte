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
