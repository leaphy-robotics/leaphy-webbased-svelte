import { getMappingInRange } from "../utils.ts";
import schema from "./schema.svg";

export default {
	schema,
	mappings: {
		...getMappingInRange("C", ".GND", 3, 0, 0),
		...getMappingInRange("C", ".VCC", 3, 0, 4),
		...getMappingInRange("C", ".SCL", 3, 0, 8),
		...getMappingInRange("C", ".SDA", 3, 0, 12),

		...getMappingInRange("C", ".SDA", 4, 7, 32),
		...getMappingInRange("C", ".SCL", 4, 7, 36),
		...getMappingInRange("C", ".VCC", 4, 7, 40),
		...getMappingInRange("C", ".GND", 4, 7, 44),

		GND: "connector28pin",
		ECHO: "connector29pin",
		TRIG: "connector30pin",
		VCC: "connector31pin",
	},
};
