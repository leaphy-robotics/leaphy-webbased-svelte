import robotsGroups from "$domain/robots.groups";
import icon from "./hand_sensor.svg";

export default {
	name: "Hand sensor",
	sketch: () => import("./hand_sensor.json"),
	boards: robotsGroups.L_FLITZ_ALL,
	icon,
};
