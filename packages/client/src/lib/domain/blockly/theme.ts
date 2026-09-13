import { Theme } from "blockly";

const [blockStyles, categoryStyles] = [
	{
		leaphy_blocks: { colourPrimary: "#06778f", hat: "cap" },
		mesh_blocks: { colourPrimary: "#009999" },
		loop_blocks: { colourPrimary: "#D9B53F" },
		math_blocks: { colourPrimary: "#75B342" },
		text_blocks: { colourPrimary: "#75B342" },
		logic_blocks: { colourPrimary: "#75B342" },
		variable_blocks: { colourPrimary: "#DE7C3B" },
		list_blocks: { colourPrimary: "#a500cf" },
		procedure_blocks: { colourPrimary: "#4095CE" },
		ble_blocks: { colourPrimary: "#0082fc" },
		ml_blocks: { colourPrimary: "#2e8b57" },
		teachable_blocks: { colourPrimary: "#1d6c37" },
	},

	{
		leaphy_category: { colour: "#06778f" },
		mesh_category: { colour: "#009999" },
		situation_category: { colour: "#D9B53F" },
		numbers_category: { colour: "#75B342" },
		variables_category: { colour: "#DE7C3B" },
		lists_category: { colour: "#a500cf" },
		functions_category: { colour: "#4095CE" },
		ble_category: { colour: "#0082fc" },
		ml_category: { colour: "#2e8b57" },
		teachable_category: { colour: "#1d6c37" },
	}
]

export const dark = Theme.defineTheme("leaphy-dark", {
	name: "leaphy-dark",
	blockStyles,
	categoryStyles,
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
	blockStyles,
	categoryStyles,
	componentStyles: {
		toolboxBackgroundColour: "#343444",
		toolboxForegroundColour: "#fff",
		flyoutBackgroundColour: "#FFFFFF",
		flyoutForegroundColour: "#000",
		insertionMarkerColour: "#000",
		scrollbarColour: "#ccc",
		flyoutOpacity: 1,
	},
	name: "light",
});
