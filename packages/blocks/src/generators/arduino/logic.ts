import type { Arduino } from "../arduino";

function getCodeGenerators(arduino: Arduino) {
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

	arduino.forBlock.logic_compare = (block) => {
		const OPERATORS: Record<string, string> = {
			EQ: "==",
			NEQ: "!=",
			LT: "<",
			LTE: "<=",
			GT: ">",
			GTE: ">=",
		};
		const operator = OPERATORS[block.getFieldValue("OP")];
		const order =
			operator === "==" || operator === "!="
				? arduino.ORDER_EQUALITY
				: arduino.ORDER_RELATIONAL;
		const argument0 = arduino.valueToCode(block, "A", order) || "0";
		const argument1 = arduino.valueToCode(block, "B", order) || "0";

		const code = `${argument0} ${operator} ${argument1}`;
		return [code, order];
	};

	arduino.forBlock.logic_operation = (block) => {
		const operator = block.getFieldValue("OP") === "AND" ? "&&" : "||";
		const order =
			operator === "&&" ? arduino.ORDER_LOGICAL_AND : arduino.ORDER_LOGICAL_OR;
		let argument0 = arduino.valueToCode(block, "A", order) || "false";
		let argument1 = arduino.valueToCode(block, "B", order) || "false";
		if (!argument0 && !argument1) {
			// If there are no arguments, then the return value is false.
			argument0 = "false";
			argument1 = "false";
		} else {
			// Single missing arguments have no effect on the return value.
			const defaultArgument = operator === "&&" ? "true" : "false";
			if (!argument0) {
				argument0 = defaultArgument;
			}
			if (!argument1) {
				argument1 = defaultArgument;
			}
		}

		const code = `${argument0} ${operator} ${argument1}`;
		return [code, order];
	};

	arduino.forBlock.logic_negate = (block) => {
		const order = arduino.ORDER_UNARY_PREFIX;
		const argument0 = arduino.valueToCode(block, "BOOL", order) || "false";
		const code = `!${argument0}`;
		return [code, order];
	};

	arduino.forBlock.logic_boolean = (block) => {
		const code = block.getFieldValue("BOOL") === "TRUE" ? "true" : "false";
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.logic_null = () => {
		const code = "NULL";
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.logic_ternary = (block) => {
		const valueIf =
			arduino.valueToCode(block, "IF", arduino.ORDER_CONDITIONAL) || "false";
		const valueThen =
			arduino.valueToCode(block, "THEN", arduino.ORDER_CONDITIONAL) || "null";
		const valueElse =
			arduino.valueToCode(block, "ELSE", arduino.ORDER_CONDITIONAL) || "null";
		const code = `${valueIf} ? ${valueThen} : ${valueElse}`;
		return [code, arduino.ORDER_CONDITIONAL];
	};
}

export default getCodeGenerators;
