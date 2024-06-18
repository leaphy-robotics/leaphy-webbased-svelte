import robotsGroups from "$domain/robots.groups";
import { RobotType } from "$domain/robots.types";
import icon from "./blink_distance.svg";

export default {
	name: "Distance blink",
	sketch: () => import("./blink_distance.json"),
	boards: [
		...robotsGroups.ALL,
		-RobotType.L_FLITZ_NANO,
		-RobotType.L_FLITZ_UNO,
	],
	icon,
};
