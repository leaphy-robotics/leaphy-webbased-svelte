import { RobotType } from "$domain/robots.types";
import icon from "./belly_sensor.svg";

export default {
	name: "Belly sensor",
	sketch: () => import("./belly_sensor.json"),
	boards: [RobotType.L_FLITZ_NANO],
	icon,
};
