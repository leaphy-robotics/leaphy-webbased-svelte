import { type List, listManager } from "../../categories/lists";
import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";

function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.lists_add = (block) => {
		arduino.addDependency(Dependencies.LIST);
		const list = listManager.getItem(block.getFieldValue("LIST")) as List;
		const value =
			arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";

		const name = list.name.replaceAll(" ", "_");
		return `${name}.add(${value});\n`;
	};

	arduino.forBlock.lists_delete = (block) => {
		arduino.addDependency(Dependencies.LIST);
		const list = listManager.getItem(block.getFieldValue("LIST")) as List;
		const index =
			arduino.valueToCode(block, "INDEX", arduino.ORDER_ATOMIC) || "0";

		const name = list.name.replaceAll(" ", "_");
		return `${name}.remove(${index});\n`;
	};

	arduino.forBlock.lists_clear = (block) => {
		arduino.addDependency(Dependencies.LIST);
		const list = listManager.getItem(block.getFieldValue("LIST")) as List;

		const name = list.name.replaceAll(" ", "_");
		return `${name}.clear();\n`;
	};

	arduino.forBlock.lists_insert = (block) => {
		arduino.addDependency(Dependencies.LIST);
		const list = listManager.getItem(block.getFieldValue("LIST")) as List;
		const value =
			arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
		const index =
			arduino.valueToCode(block, "INDEX", arduino.ORDER_ATOMIC) || "0";

		const name = list.name.replaceAll(" ", "_");
		return `${name}.addAtIndex(${index}, ${value});\n`;
	};

	arduino.forBlock.lists_get = (block) => {
		arduino.addDependency(Dependencies.LIST);
		const list = listManager.getItem(block.getFieldValue("LIST")) as List;
		const index =
			arduino.valueToCode(block, "INDEX", arduino.ORDER_ATOMIC) || "0";

		const name = list.name.replaceAll(" ", "_");
		return [`${name}.get(${index})`, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.lists_replace = (block) => {
		arduino.addDependency(Dependencies.LIST);
		const list = listManager.getItem(block.getFieldValue("LIST")) as List;
		const value =
			arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
		const index =
			arduino.valueToCode(block, "INDEX", arduino.ORDER_ATOMIC) || "0";

		const name = list.name.replaceAll(" ", "_");
		return `${name}.remove(${index});\n${name}.addAtIndex(${index}, ${value});\n`;
	};

	arduino.forBlock.lists_length = (block) => {
		arduino.addDependency(Dependencies.LIST);
		const list = listManager.getItem(block.getFieldValue("LIST")) as List;

		const name = list.name.replaceAll(" ", "_");
		return [`${name}.getSize()`, arduino.ORDER_ATOMIC];
	};
}

export default getCodeGenerators;
