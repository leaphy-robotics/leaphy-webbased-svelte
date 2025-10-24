import type { Arduino } from "../arduino";

function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.text = (block) => {
		const code = arduino.quote_(block.getFieldValue("TEXT"));
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.text_join = (block) => {
		const ADD0 = arduino.valueToCode(block, "ADD0", arduino.ORDER_NONE);
		const ADD1 = arduino.valueToCode(block, "ADD1", arduino.ORDER_NONE);
		const code = `String(${ADD0}) + String(${ADD1})`;

		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.text_length = (block) => {
		const value = arduino.valueToCode(block, "VALUE", arduino.ORDER_NONE);
		const code = `String(${value}).length()`;

		return [code, arduino.ORDER_ATOMIC];
	}

	arduino.forBlock.text_charAt = (block) => {
		const at = arduino.valueToCode(block, "AT", arduino.ORDER_NONE);
		const value = arduino.valueToCode(block, "VALUE", arduino.ORDER_NONE);
		const code = `String(${value}[${at}])`;

		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.text_includes = (block) => {
		const value = arduino.valueToCode(block, "VALUE", arduino.ORDER_NONE);
		const check = arduino.valueToCode(block, "CHECK", arduino.ORDER_NONE);
		const code = `String(${value}).indexOf(${check}) != -1`;

		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.text_to_double = (block) => {
		const value = arduino.valueToCode(block, "VALUE", arduino.ORDER_NONE);

		return [`${value}.toDouble()`, arduino.ORDER_ATOMIC];
	};
}

export default getCodeGenerators;
