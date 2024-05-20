import robotsGroups from "$domain/robots.groups";
import { RobotType } from "$domain/robots.types";
import icon from "./distance.svg";

export default {
	name: "Show distance",
	sketch: () => import("./distance.json"),
	boards: [
		...robotsGroups.ALL,
		-RobotType.L_FLITZ_NANO,
		-RobotType.L_FLITZ_UNO,
	],
	icon,
};
