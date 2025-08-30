import { getMappingInRange } from "../utils";
import schema from "./schema.svg";

export default {
	schema,
	mappings: {
		...getMappingInRange("D", "", 12, 2, 30),
		...getMappingInRange("D", ".3V3", 12, 2, 15),
		...getMappingInRange("D", ".GND", 12, 2, 0),

		...getMappingInRange("", "", 12, 2, 30),
		...getMappingInRange("", ".3V3", 12, 2, 15),
		...getMappingInRange("", ".GND", 12, 2, 0),

		...getMappingInRange("A", "", 0, 7, 78),
		...getMappingInRange("A", ".3V3", 0, 7, 93),
		...getMappingInRange("A", ".GND", 0, 7, 108),

		...getMappingInRange("D", "", 14, 19, 78),
		...getMappingInRange("D", ".3V3", 14, 19, 93),
		...getMappingInRange("D", ".GND", 14, 19, 108),

		...getMappingInRange("", "", 14, 19, 78),
		...getMappingInRange("", ".3V3", 14, 19, 93),
		...getMappingInRange("", ".GND", 14, 19, 108),

		D13: "connector75pin",
		"D13.3V3": "connector90pin",
		"D13.GND": "connector105pin",

		"13": "connector75pin",
		"13.3V3": "connector90pin",
		"13.GND": "connector105pin",

		SDA: "connector82pin",
		"SDA.3V3": "connector97pin",
		"SDA.GND": "connector112pin",

		SCL: "connector83pin",
		"SCL.3V3": "connector98pin",
		"SCL.GND": "connector113pin",

		"5V": "connector86pin",
		"5V.3V3": "connector101pin",
		"5V.GND": "connector116pin",

		"3V3": "connector76pin",
		"3V3.3V3": "connector91pin",
		"3V3.GND": "connector106pin",

		GND: "connector41pin",
		"GND.3V3": "connector26pin",
		"GND.GND": "connector11pin",

		GND2: "connector88pin",
		"GND2.3V3": "connector103pin",
		"GND2.GND": "connector118pin",
	},
};
