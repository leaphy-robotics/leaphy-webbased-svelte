import type { BlockDefinition } from "blockly/core/blocks";

const rawKeys = "abcdefghijklmnopqrstuvwxyz";
const keys = [
	["%{BKY_LEAPHY_KEY_SPACE}", "Space"],
	["%{BKY_LEAPHY_KEY_ARROW_UP}", "ArrowUp"],
	["%{BKY_LEAPHY_KEY_ARROW_DOWN}", "ArrowDown"],
	["%{BKY_LEAPHY_KEY_ARROW_LEFT}", "ArrowLeft"],
	["%{BKY_LEAPHY_KEY_ARROW_RIGHT}", "ArrowRight"],
	...rawKeys.split("").map((key) => [key, `Key${key.toUpperCase()}`]),
	...new Array(10).fill(0).map((_, digit) => [`${digit}`, `Digit${digit}`]),
];

const blocks: BlockDefinition = [
	{
		type: "ble_setup",
		style: "ble_blocks",
		message0: "%{BKY_LEAPHY_BLE_SETUP}",
		args0: [
			{
				type: "field_input",
				name: "NAME",
				text: "Leaphy Robot",
				spellcheck: false,
			},
		],
		previousStatement: null,
		nextStatement: null,
	},
	{
		type: "ble_update",
		style: "ble_blocks",
		message0: "%{BKY_LEAPHY_BLE_UPDATE}",
		previousStatement: null,
		nextStatement: null,
	},

	{
		type: "ble_is_pressed",
		message0: "%{BKY_LEAPHY_BLE_IS_PRESSED}",
		args0: [
			{
				type: "field_dropdown",
				name: "KEY",
				options: keys,
			},
		],
		style: "ble_blocks",
		output: "Boolean",
	},
];

export { blocks };
