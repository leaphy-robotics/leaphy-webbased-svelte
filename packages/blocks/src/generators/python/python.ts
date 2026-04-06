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
			(variableModel) => generator.getVariableName(variableModel.getName()),
		);
		const variableLines =
			variableNames.length > 0
				? `${generator.INDENT}global ${variableNames.join(", ")}\n`
				: "";
		let branch = generator.statementToCode(block, "STACK");
		branch = generator.addLoopTrap(branch, block);

		let code = `def ${funcName}():\n${variableLines}${branch}`;
		return `${code}\n`;
	};

	python.forBlock.math_change = (block, generator) => {
		// Micropython does not support the Number type that the default block uses.
		const amount = generator.valueToCode(block, "DELTA", Order.ADDITIVE);
		const target_var = generator.getVariableName(block.getFieldValue("VAR"));
		return `${target_var} = (${target_var} if isinstance(${target_var},int) or isinstance(${target_var},float) else 0) + ${amount}\n`;
	};
}

export default getCodeGenerators;
