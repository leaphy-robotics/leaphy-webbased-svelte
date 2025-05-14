import { Variables } from "blockly/core";
import { Order } from "blockly/python";
import type { MicroPythonGenerator } from "../python";

function getCodeGenerators(python: MicroPythonGenerator) {
	python.forBlock.leaphy_start = (block, generator) => {
		const funcName = "leaphy_program";
		// TODO: find out which variables are actually *used* in the function.
		// Currently *all* variables are included, even when they are not used.
		const workspace = block.workspace;
		const variableNames = Variables.allUsedVarModels(workspace).map(
			(variableModel) => variableModel.name,
		);
		const variableLines =
			variableNames.length > 0
				? `${generator.INDENT}global ${variableNames.join(", ")}\n`
				: "";
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

		let code = `def ${funcName}():\n${variableLines}${branch}`;
		generator.addDefinition(funcName, code);

		return `${funcName}()\n`;
	};

	python.forBlock.math_change = (block, generator) => {
		// Micropython does not support the Number type that the default block uses.
		const amount = generator.valueToCode(block, "DELTA", Order.ADDITIVE);
		const target_var = generator.getVariableName(block.getFieldValue("VAR"));
		return `${target_var} = (${target_var} if isinstance(${target_var},int) or isinstance(${target_var},float) else 0) + ${amount}\n`;
	};
}

export default getCodeGenerators;
