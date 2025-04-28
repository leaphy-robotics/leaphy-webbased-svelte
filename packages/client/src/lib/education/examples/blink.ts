import robotsGroups from "$domain/robots.groups";
import { RobotType } from "$domain/robots.types";
import icon from "./blink.svg";

export default {
	name: "Blink",
	sketch: () => import("./blink.json"),
	boards: [
		...robotsGroups.ALL,
		-RobotType.L_FLITZ_NANO,
		-RobotType.L_FLITZ_UNO,
	],
	icon,
};
