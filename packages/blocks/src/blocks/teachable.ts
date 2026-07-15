import type { BlockDefinition } from "blockly/core/blocks";

const blocks: BlockDefinition = [
	{
		type: "teachable_audio_classify",
		message0: "%{BKY_TEACHABLE_AUDIO_CLASSIFY}",
		style: "ml_blocks",
		previousStatement: null,
		nextStatement: null,

		aiHelp: "Listen for one second and classify the recorded sound",
		relevanceKey: "ML",
	},
	{
		type: "teachable_audio_detected",
		message0: "%{BKY_TEACHABLE_AUDIO_DETECTED}",
		args0: [{ type: "input_dummy", name: "CLASS" }],
		inputsInline: true,
		extensions: ["teachable_class_select_extension"],
		style: "ml_blocks",
		output: "Boolean",

		aiHelp: "Check whether the selected sound class was detected",
		relevanceKey: "ML",
	},
	{
		type: "teachable_audio_confidence",
		message0: "%{BKY_TEACHABLE_AUDIO_CONFIDENCE}",
		args0: [{ type: "input_dummy", name: "CLASS" }],
		inputsInline: true,
		extensions: ["teachable_class_select_extension"],
		style: "ml_blocks",
		output: "Number",

		aiHelp: "Get the selected sound class confidence from 0 to 100",
		relevanceKey: "ML",
	},
];

export { blocks };
