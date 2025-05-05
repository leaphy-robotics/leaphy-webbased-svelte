import type { PythonGenerator } from "blockly/python";
import { registerDefinition } from "../python";

function getCodeGenerators(python: PythonGenerator) {
	python.forBlock.leaphy_start = (block, generator) => {
		const funcName = "leaphy_program";
		let branch = generator.statementToCode(block, "STACK");
		if (generator.STATEMENT_PREFIX) {
			const id = block.id.replace(/\$/g, "$$$$");
			branch =
				generator.prefixLines(
					generator.STATEMENT_PREFIX.replace(/%1/g, `'${id}'`),
					generator.INDENT,
				) + branch;
		}
		if (generator.INFINITE_LOOP_TRAP) {
			branch =
				generator.INFINITE_LOOP_TRAP.replace(/%1/g, `'${block.id}'`) + branch;
		}

		let code = `def ${funcName}():\n${branch}`;
		registerDefinition(generator, funcName, code);

		return `${funcName}()\n`;
	};
}

export default getCodeGenerators;
