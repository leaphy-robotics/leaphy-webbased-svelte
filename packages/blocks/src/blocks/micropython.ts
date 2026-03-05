import type { BlockDefinition } from "blockly/core/blocks";

const blocks: BlockDefinition = [
	/*{
        type: "raw_code_line",
        message0:"code: %1",
        args0: [
            {
                type: "field_input",
                name: "CODE_LINE",
                text: "print(\"Hello world!\")",
                spellcheck: false
            }
        ],
        style:"leaphy_blocks"
    },*/
	{
		type: "raw_code_line",
		tooltip: "",
		helpUrl: "",
		message0: "%1 %2",
		args0: [
			{
				type: "field_input",
				name: "CODE_INPUT",
				text: 'print("Hello world!")',
			},
			{
				type: "input_dummy",
				name: "CODE_DUMMY",
				align: "RIGHT",
			},
		],
		previousStatement: null,
		nextStatement: null,
		style: "leaphy_blocks",
		inputsInline: true,
	},
];

export { blocks };
