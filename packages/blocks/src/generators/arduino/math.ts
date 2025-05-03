import * as Blockly from "blockly/core";
import type { Arduino } from "../arduino";

function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.math_number = (block) => {
		// Numeric value.
		let code = block.getFieldValue("NUM");

		const val = Number.parseFloat(code);
		if (val === Number.POSITIVE_INFINITY) {
			code = "INFINITY";
		} else if (val === Number.NEGATIVE_INFINITY) {
			code = "-INFINITY";
		}
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.math_arithmetic = (block) => {
		const OPERATORS: Record<string, [string | null, number]> = {
			ADD: [" + ", arduino.ORDER_ADDITIVE],
			MINUS: [" - ", arduino.ORDER_ADDITIVE],
			MULTIPLY: [" * ", arduino.ORDER_MULTIPLICATIVE],
			DIVIDE: [" / ", arduino.ORDER_MULTIPLICATIVE],
			POWER: [null, arduino.ORDER_NONE], // Handle power separately.
		};
		const tuple = OPERATORS[block.getFieldValue("OP")];
		const operator = tuple[0];
		const order = tuple[1];
		const argument0 = arduino.valueToCode(block, "A", order) || "0";
		const argument1 = arduino.valueToCode(block, "B", order) || "0";

		let code: string;
		// Power in C++ requires a special case since it has no operator.
		if (!operator) {
			code = `Math.pow(${argument0}, ${argument1})`;
			return [code, arduino.ORDER_UNARY_POSTFIX];
		}
		code = argument0 + operator + argument1;
		return [code, order];
	};

	arduino.forBlock.math_single = (block) => {
		const operator = block.getFieldValue("OP");
		let code: string | undefined;
		let arg: string;
		if (operator === "NEG") {
			// Negation is a special case given its different operator precedents.
			arg =
				arduino.valueToCode(block, "NUM", arduino.ORDER_UNARY_PREFIX) || "0";
			if (arg[0] === "-") {
				// --3 is not legal in C++ in this context.
				arg = ` ${arg}`;
			}
			code = `-${arg}`;
			return [code, arduino.ORDER_UNARY_PREFIX];
		}
		if (operator === "ABS" || operator.substring(0, 5) === "ROUND") {
			arg =
				arduino.valueToCode(block, "NUM", arduino.ORDER_UNARY_POSTFIX) || "0";
		} else if (operator === "SIN" || operator === "COS" || operator === "TAN") {
			arg =
				arduino.valueToCode(block, "NUM", arduino.ORDER_MULTIPLICATIVE) || "0";
		} else {
			arg = arduino.valueToCode(block, "NUM", arduino.ORDER_NONE) || "0";
		}
		// First, handle cases which generate values that don't need parentheses.
		switch (operator) {
			case "ABS":
				code = `abs(${arg})`;
				break;
			case "ROOT":
				code = `sqrt(${arg})`;
				break;
			case "LN":
				code = `log(${arg})`;
				break;
			case "EXP":
				code = `exp(${arg})`;
				break;
			case "POW10":
				code = `pow(10,${arg})`;
				break;
			case "ROUND":
				code = `round(${arg})`;
				break;
			case "ROUNDUP":
				code = `ceil(${arg})`;
				break;
			case "ROUNDDOWN":
				code = `floor(${arg})`;
				break;
			case "SIN":
				code = `sin(${arg} / 180 * M_PI)`;
				break;
			case "COS":
				code = `cos(${arg} / 180 * M_PI)`;
				break;
			case "TAN":
				code = `tan(${arg} / 180 * M_PI)`;
				break;
		}
		if (code) {
			return [code, arduino.ORDER_UNARY_POSTFIX];
		}
		// Second, handle cases which generate values that may need parentheses.
		switch (operator) {
			case "LOG10":
				code = `log(${arg}) / log(10)`;
				break;
			case "ASIN":
				code = `asin(${arg}) / M_PI * 180`;
				break;
			case "ACOS":
				code = `acos(${arg}) / M_PI * 180`;
				break;
			case "ATAN":
				code = `atan(${arg}) / M_PI * 180`;
				break;
			default:
				throw `Unknown math operator: ${operator}`;
		}
		return [code, arduino.ORDER_MULTIPLICATIVE];
	};

	arduino.forBlock.math_constant = (block) => {
		const CONSTANTS: Record<string, [string, number]> = {
			PI: ["M_PI", arduino.ORDER_UNARY_POSTFIX],
			E: ["M_E", arduino.ORDER_UNARY_POSTFIX],
			GOLDEN_RATIO: ["(1 + sqrt(5)) / 2", arduino.ORDER_MULTIPLICATIVE],
			SQRT2: ["M_SQRT2", arduino.ORDER_UNARY_POSTFIX],
			SQRT1_2: ["M_SQRT1_2", arduino.ORDER_UNARY_POSTFIX],
			INFINITY: ["INFINITY", arduino.ORDER_ATOMIC],
		};
		return CONSTANTS[block.getFieldValue("CONSTANT")];
	};

	arduino.forBlock.math_number_property = (block) => {
		const number_to_check =
			arduino.valueToCode(
				block,
				"NUMBER_TO_CHECK",
				arduino.ORDER_MULTIPLICATIVE,
			) || "0";
		const dropdown_property = block.getFieldValue("PROPERTY");
		let code = "";
		if (dropdown_property === "PRIME") {
			const func = [
				"boolean mathIsPrime(int n) {",
				"  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods",
				"  if (n == 2 || n == 3) {",
				"    return true;",
				"  }",
				"  // False if n is NaN, negative, is 1.",
				"  // And false if n is divisible by 2 or 3.",
				"  if (isnan(n) || (n <= 1) || (n == 1) || (n % 2 == 0) || " +
					"(n % 3 == 0)) {",
				"    return false;",
				"  }",
				"  // Check all the numbers of form 6k +/- 1, up to sqrt(n).",
				"  for (int x = 6; x <= sqrt(n) + 1; x += 6) {",
				"    if (n % (x - 1) == 0 || n % (x + 1) == 0) {",
				"      return false;",
				"    }",
				"  }",
				"  return true;",
				"}",
			];
			arduino.addDeclaration("mathIsPrime", func.join("\n"));
			arduino.addInclude("math", "#include <math.h>");
			code = `mathIsPrime(${number_to_check})`;
			return [code, arduino.ORDER_UNARY_POSTFIX];
		}
		switch (dropdown_property) {
			case "EVEN":
				code = `${number_to_check} % 2 == 0`;
				break;
			case "ODD":
				code = `${number_to_check} % 2 == 1`;
				break;
			case "WHOLE":
				arduino.addInclude("math", "#include <math.h>");
				code = `(floor(${number_to_check}) == ${number_to_check})`;
				break;
			case "POSITIVE":
				code = `${number_to_check} > 0`;
				break;
			case "NEGATIVE":
				code = `${number_to_check} < 0`;
				break;
			case "DIVISIBLE_BY": {
				const divisor =
					arduino.valueToCode(block, "DIVISOR", arduino.ORDER_MULTIPLICATIVE) ||
					"0";
				code = `${number_to_check} % ${divisor} == 0`;
				break;
			}
		}
		return [code, arduino.ORDER_EQUALITY];
	};

	arduino.forBlock.math_change = (block) => {
		const argument0 =
			arduino.valueToCode(block, "DELTA", arduino.ORDER_ADDITIVE) || "0";
		const varName = arduino.nameDB_?.getName(
			block.getFieldValue("VAR"),
			Blockly.Names.NameType.VARIABLE,
		);
		return `${varName} += ${argument0};\n`;
	};

	/** Rounding functions have a single operand. */
	arduino.forBlock.math_round = arduino.forBlock.math_single;

	/** Trigonometry functions have a single operand. */
	arduino.forBlock.math_trig = arduino.forBlock.math_single;

	arduino.forBlock.math_modulo = (block) => {
		const argument0 =
			arduino.valueToCode(block, "DIVIDEND", arduino.ORDER_MULTIPLICATIVE) ||
			"0";
		const argument1 =
			arduino.valueToCode(block, "DIVISOR", arduino.ORDER_MULTIPLICATIVE) ||
			"0";
		const code = `${argument0} % ${argument1}`;
		return [code, arduino.ORDER_MULTIPLICATIVE];
	};

	arduino.forBlock.math_constrain = (block) => {
		// Constrain a number between two limits.
		const argument0 =
			arduino.valueToCode(block, "VALUE", arduino.ORDER_NONE) || "0";
		const argument1 =
			arduino.valueToCode(block, "LOW", arduino.ORDER_NONE) || "0";
		const argument2 =
			arduino.valueToCode(block, "HIGH", arduino.ORDER_NONE) || "0";
		const code = `(${argument0} < ${argument1} ? ${argument1} : (${argument0} > ${argument2} ? ${argument2} : ${argument0}))`;

		return [code, arduino.ORDER_UNARY_POSTFIX];
	};

	arduino.forBlock.math_random_int = (block) => {
		const argument0 =
			arduino.valueToCode(block, "FROM", arduino.ORDER_NONE) || "0";
		const argument1 =
			arduino.valueToCode(block, "TO", arduino.ORDER_NONE) || "0";
		const func = [
			"int mathRandomInt(int min, int max) {",
			"  if (min > max) {",
			"    // Swap min and max to ensure min is smaller.",
			"    int temp = min;",
			"    min = max;",
			"    max = temp;",
			"  }",
			"  return min + (rand() % (max - min + 1));",
			"}",
		];
		arduino.addDeclaration("mathRandomInt", func.join("\n"));
		arduino.addSetup("random_seed", "randomSeed(analogRead(0));");
		const code = `mathRandomInt(${argument0}, ${argument1})`;
		return [code, arduino.ORDER_UNARY_POSTFIX];
	};

	arduino.forBlock.math_random_float = () => [
		"(rand() / RAND_MAX)",
		arduino.ORDER_UNARY_POSTFIX,
	];
}

export default getCodeGenerators;
