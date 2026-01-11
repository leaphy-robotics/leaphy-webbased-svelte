import { RobotType } from "./robots.types";

const L_ARDUINO_NANO_ALL = [
	RobotType.L_NANO,
	RobotType.L_NANO_ESP32,
];
const L_FLITZ_ALL = [RobotType.L_FLITZ_UNO, RobotType.L_FLITZ_NANO];

const L_ARDUINO_ALL = [
	...L_ARDUINO_NANO_ALL,
	RobotType.L_UNO,
	RobotType.L_MEGA,
];
const ALL = [
	RobotType.L_ORIGINAL,
	RobotType.L_STARLING,
	...L_ARDUINO_ALL,
	...L_FLITZ_ALL,
];
const ALL_BUT_FLITZ = [...ALL, -RobotType.L_FLITZ_UNO, -RobotType.L_FLITZ_NANO];

export default {
	L_ARDUINO_NANO_ALL,
	L_FLITZ_ALL,
	L_ARDUINO_ALL,
	ALL,
	ALL_BUT_FLITZ,
};
