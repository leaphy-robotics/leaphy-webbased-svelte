import robotsGroups from "$domain/robots.groups";
import icon from "./snake.svg";

export default {
	name: "Snake",
	sketch: () => import("./snake.json"),
	boards: robotsGroups.L_ARDUINO_ALL,
	icon,
};
