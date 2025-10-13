import { Theme } from "blockly";

export const dark = Theme.defineTheme("leaphy-dark", {
	name: "leaphy-dark",
	blockStyles: {
		leaphy_blocks: { colourPrimary: "#066c80", hat: "cap" },
		mesh_blocks: { colourPrimary: "#009999" },
		loop_blocks: { colourPrimary: "#69530d" },
		math_blocks: { colourPrimary: "#45662a" },
		text_blocks: { colourPrimary: "#45662a" },
		logic_blocks: { colourPrimary: "#45662a" },
		variable_blocks: { colourPrimary: "#87451a" },
		list_blocks: { colourPrimary: "#3f144a" },
		procedure_blocks: { colourPrimary: "#06416c" },
		ble_blocks: { colourPrimary: "#0082fc" },
	},

	categoryStyles: {
		leaphy_category: { colour: "#066c80" },
		mesh_category: { colour: "#009999" },
		situation_category: { colour: "#69530d" },
		numbers_category: { colour: "#45662a" },
		variables_category: { colour: "#87451a" },
		lists_category: { colour: "#3f144a" },
		functions_category: { colour: "#06416c" },
		ble_category: { colour: "#0082fc" },
	},
	componentStyles: {
		toolboxBackgroundColour: "#343444",
		toolboxForegroundColour: "#fff",
		flyoutBackgroundColour: "#1e1e1e",
		flyoutForegroundColour: "#ccc",
		scrollbarColour: "#9c9a9a",
		flyoutOpacity: 1,
	},
});

export const light = Theme.defineTheme("leaphy-light", {
	blockStyles: {
		leaphy_blocks: { colourPrimary: "#06778f", hat: "cap" },
		mesh_blocks: { colourPrimary: "#009999" },
		loop_blocks: { colourPrimary: "#D9B53F" },
		math_blocks: { colourPrimary: "#75B342" },
		text_blocks: { colourPrimary: "#75B342" },
		logic_blocks: { colourPrimary: "#75B342" },
		variable_blocks: { colourPrimary: "#DE7C3B" },
		list_blocks: { colourPrimary: "#a500cf" },
		procedure_blocks: { colourPrimary: "#4095CE" },
		ml_blocks: { colourPrimary: "#2e8b57" },
		ble_blocks: { colourPrimary: "#0082fc" },
	},

	categoryStyles: {
		leaphy_category: { colour: "#06778f" },
		situation_category: { colour: "#D9B53F" },
		numbers_category: { colour: "#75B342" },
		variables_category: { colour: "#DE7C3B" },
		lists_category: { colour: "#a500cf" },
		functions_category: { colour: "#4095CE" },
		mesh_category: { colour: "#009999" },
		ml_category: { colour: "#2e8b57" },
		ble_category: { colour: "#0082fc" },
	},
	componentStyles: {
		toolboxBackgroundColour: "#343444",
		toolboxForegroundColour: "#fff",
		flyoutBackgroundColour: "#FFFFFF",
		flyoutForegroundColour: "#ccc",
		insertionMarkerColour: "#000",
		scrollbarColour: "#ccc",
		flyoutOpacity: 1,
	},
	name: "light",
});
