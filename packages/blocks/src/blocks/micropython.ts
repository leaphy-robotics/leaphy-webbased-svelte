import type { BlockDefinition } from "blockly/core/blocks";


const blocks: BlockDefinition = [
	{
		type: "leaphy_dht22_read_temperature",
		message0: "%%{BKY_LEAPHY_DHT22_READ_TEMPERATURE} %1",
		args0: [
			{
				type: "field_pin_selector",
				name: "PIN",
				mode: "digital",
			},
		],
		style: "leaphy_blocks",
		output: "Number",
		helpUrl: "",
	},
	{
		type: "leaphy_dht22_read_humidity",
		message0: "%%{BKY_LEAPHY_DHT22_READ_HUMIDITY} %1",
		args0: [
			{
				type: "field_pin_selector",
				name: "PIN",
				mode: "digital",
			},
		],
		style: "leaphy_blocks",
		output: "Number",
		helpUrl: "",
	},
];

export { blocks };
