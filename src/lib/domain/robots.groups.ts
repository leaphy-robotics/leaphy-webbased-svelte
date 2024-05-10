import { RobotType } from "./robots.types";

const L_ORIGINAL_NANO_ALL = [
	RobotType.L_ORIGINAL_NANO,
	RobotType.L_ORIGINAL_NANO_ESP32,
	RobotType.L_ORIGINAL_NANO_RP2040,
];
const L_ARDUINO_NANO_ALL = [
	RobotType.L_NANO,
	RobotType.L_NANO_ESP32,
	RobotType.L_NANO_RP2040,
];
const L_NANO_ALL = [...L_ORIGINAL_NANO_ALL, ...L_ARDUINO_NANO_ALL];
const L_ORIGINAL_ALL = [...L_ORIGINAL_NANO_ALL, RobotType.L_ORIGINAL_UNO];
const L_FLITZ_ALL = [RobotType.L_FLITZ_UNO, RobotType.L_FLITZ_NANO];
const L_ARDUINO_ALL = [
	...L_ARDUINO_NANO_ALL,
	RobotType.L_UNO,
	RobotType.L_MEGA,
];
const ALL = [
	...L_ORIGINAL_ALL,
	...L_ARDUINO_ALL,
	...L_FLITZ_ALL,
	RobotType.L_CLICK,
];

export default {
	L_ORIGINAL_NANO_ALL,
	L_ARDUINO_NANO_ALL,
	L_NANO_ALL,
	L_ORIGINAL_ALL,
	L_FLITZ_ALL,
	L_ARDUINO_ALL,
	ALL,
};
