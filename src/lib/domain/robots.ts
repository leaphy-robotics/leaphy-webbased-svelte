import defaultCPP from "$assets/default-program.ino?raw";
import defaultPython from "$assets/default-program.py?raw";
import flitzNanoBackground from "$assets/robots/backgrounds/flitz_nano.svg";
import flitzUnoBackground from "$assets/robots/backgrounds/flitz_uno.svg";
import originalNanoBackground from "$assets/robots/backgrounds/orig_nano.svg";
import originalNanoESP32Background from "$assets/robots/backgrounds/orig_nano_esp32.svg";
import originalNanoRP2040Background from "$assets/robots/backgrounds/orig_nano_rp2040.svg";
import originalUnoBackground from "$assets/robots/backgrounds/orig_uno.svg";
import cppIcon from "$assets/robots/icons/l_c++.svg";
import clickIcon from "$assets/robots/icons/l_click.svg";
import flitzIcon from "$assets/robots/icons/l_flitz.svg";
import megaIcon from "$assets/robots/icons/l_mega.svg";
import microPythonIcon from "$assets/robots/icons/l_micropython.svg";
import nanoIcon from "$assets/robots/icons/l_nano.svg";
import originalIcon from "$assets/robots/icons/l_original.svg";
import unoIcon from "$assets/robots/icons/l_uno.svg";
import robotsGroups from "$domain/robots.groups";
import { Mode, mode } from "$state/workspace.svelte";
import type { ComponentType } from "svelte";
import { get } from "svelte/store";
import AvrDude from "../programmers/AvrDude";
import DFU from "../programmers/DFU";
import Pico from "../programmers/Pico";
import { type Programmer, RobotType } from "./robots.types";

const DEFAULT_LIBRARIES = [
	"Leaphy Extensions",
	"Servo",
	"Adafruit GFX Library",
	"Adafruit SSD1306",
	"Adafruit LSM9DS1 Library",
	"Adafruit Unified Sensor",
	"List",
	"Adafruit SGP30 Sensor",
	"Adafruit_VL53L0X",
	"Adafruit BMP280 Library",
	"TM1637",
	"LedControl",
	"DS3231",
];

interface BaseRobot {
	name: string;
	icon: string;
	saveAddress: string;
}

export interface RobotDevice extends BaseRobot {
	id: string;
	type: number;
	mapping: PinMapping;
	programmer: Programmer;
	libraries: string[];
	fqbn: string;
	background?: string;
	board: string;
}
export interface RobotListing extends BaseRobot {
	defaultRobot: RobotDevice;
	defaultProgram?: string;
	mode?: (typeof Mode)[keyof typeof Mode];
}
export type Robot = RobotDevice | RobotListing;

export enum PinMapping {
	UNO = 0,
	NANO = 1,
	MEGA = 2,
}

const baseUno = {
	mapping: PinMapping.UNO,
	fqbn: "arduino:avr:uno",
	programmer: new AvrDude("atmega328p"),
	board: "l_uno",
};

const baseNano = {
	mapping: PinMapping.NANO,
	fqbn: "arduino:avr:nano",
	programmer: new AvrDude("atmega328p"),
	board: "l_nano",
};

const baseNanoESP32 = {
	mapping: PinMapping.NANO,
	fqbn: "arduino:esp32:nano_nora",
	programmer: new DFU(),
	board: "l_nano_esp32",
};

const baseNanoRP2040 = {
	mapping: PinMapping.NANO,
	fqbn: "arduino:mbed_nano:nanorp2040connect",
	programmer: new Pico(),
	board: "l_nano_rp2040",
};

const robotDevices: RobotDevice[] = [
	{
		...baseUno,
		id: "l_flitz_uno",
		saveAddress: "l_flitz",
		type: RobotType.L_FLITZ_UNO,
		name: "Flitz Uno",
		libraries: DEFAULT_LIBRARIES,
		icon: flitzIcon,
		background: flitzUnoBackground,
	},
	{
		...baseNano,
		id: "l_flitz_nano",
		saveAddress: "l_flitz",
		type: RobotType.L_FLITZ_NANO,
		name: "Flitz Nano",
		libraries: DEFAULT_LIBRARIES,
		icon: flitzIcon,
		background: flitzNanoBackground,
	},
	{
		...baseUno,
		id: "l_original_uno",
		saveAddress: "l_original",
		type: RobotType.L_ORIGINAL_UNO,
		name: "Original Uno",
		libraries: DEFAULT_LIBRARIES.concat([
			"QMC5883LCompass",
			"Arduino_APDS9960",
		]),
		icon: originalIcon,
		background: originalUnoBackground,
	},
	{
		...baseNano,
		id: "l_original_nano",
		saveAddress: "l_original",
		type: RobotType.L_ORIGINAL_NANO,
		name: "Original Nano",
		libraries: DEFAULT_LIBRARIES.concat([
			"QMC5883LCompass",
			"Arduino_APDS9960",
		]),
		icon: originalIcon,
		background: originalNanoBackground,
	},
	{
		...baseNanoESP32,
		id: "l_original_nano_esp32",
		saveAddress: "l_original",
		type: RobotType.L_ORIGINAL_NANO_ESP32,
		name: "Original Nano ESP32",
		libraries: DEFAULT_LIBRARIES.concat([
			"QMC5883LCompass",
			"Arduino_APDS9960",
			"Painless Mesh",
			"AsyncTCP",
		]),
		icon: originalIcon,
		background: originalNanoESP32Background,
	},
	{
		...baseNanoRP2040,
		id: "l_original_nano_rp2040",
		saveAddress: "l_original",
		type: RobotType.L_ORIGINAL_NANO_RP2040,
		name: "Original Nano RP2040",
		libraries: DEFAULT_LIBRARIES.concat([
			"QMC5883LCompass",
			"Arduino_APDS9960",
		]),
		icon: originalIcon,
		background: originalNanoRP2040Background,
	},
	{
		...baseUno,
		id: "l_click",
		saveAddress: "l_click",
		type: RobotType.L_CLICK,
		name: "Leaphy Click",
		libraries: DEFAULT_LIBRARIES,
		icon: clickIcon,
	},
	{
		...baseNano,
		id: "l_nano",
		saveAddress: "l_nano",
		type: RobotType.L_NANO,
		name: "Arduino Nano",
		libraries: DEFAULT_LIBRARIES.concat([
			"QMC5883LCompass",
			"Arduino_APDS9960",
		]),
		icon: nanoIcon,
	},
	{
		...baseNanoESP32,
		id: "l_nano_esp32",
		saveAddress: "l_nano",
		type: RobotType.L_NANO_ESP32,
		name: "Arduino Nano ESP32",
		libraries: DEFAULT_LIBRARIES.concat([
			"QMC5883LCompass",
			"Arduino_APDS9960",
			"Painless Mesh",
			"AsyncTCP",
		]),
		icon: nanoIcon,
	},
	{
		...baseNanoRP2040,
		id: "l_nano_rp2040",
		saveAddress: "l_nano",
		type: RobotType.L_NANO_RP2040,
		name: "Arduino Nano RP2040",
		libraries: DEFAULT_LIBRARIES.concat([
			"QMC5883LCompass",
			"Arduino_APDS9960",
		]),
		icon: nanoIcon,
	},
	{
		...baseUno,
		id: "l_uno",
		saveAddress: "l_uno",
		type: RobotType.L_UNO,
		name: "Arduino Uno",
		libraries: DEFAULT_LIBRARIES.concat([
			"QMC5883LCompass",
			"Arduino_APDS9960",
		]),
		icon: unoIcon,
	},
	{
		id: "l_mega",
		type: RobotType.L_MEGA,
		saveAddress: "l_mega",
		mapping: PinMapping.MEGA,
		name: "Arduino Mega",
		programmer: new AvrDude("atmega2560"),
		fqbn: "arduino:avr:mega",
		libraries: DEFAULT_LIBRARIES.concat([
			"QMC5883LCompass",
			"Arduino_APDS9960",
		]),
		icon: megaIcon,
		board: "l_mega",
	},
];

export type Robots = {
	[K in (typeof robotDevices)[number]["id"]]: RobotDevice;
};
export const robots: Robots = robotDevices.reduce((robots, robot) => {
	robots[robot.id] = robot;
	return robots;
}, {} as Robots);

export const robotListing: RobotListing[][] = [
	[
		{
			saveAddress: "l_flitz",
			name: "Leaphy Flitz",
			icon: flitzIcon,
			defaultRobot: robots.l_flitz_uno,
		},
		{
			saveAddress: "l_original",
			name: "Leaphy Original",
			icon: originalIcon,
			defaultRobot: robots.l_original_uno,
		},
		{
			saveAddress: "l_click",
			name: "Leaphy Click",
			icon: clickIcon,
			defaultRobot: robots.l_click,
		},
	],
	[
		{
			saveAddress: "l_nano",
			name: "Arduino Nano",
			icon: nanoIcon,
			defaultRobot: robots.l_nano,
		},
		{
			saveAddress: "l_uno",
			name: "Arduino Uno",
			icon: unoIcon,
			defaultRobot: robots.l_uno,
		},
		{
			saveAddress: "l_mega",
			name: "Arduino Mega",
			icon: megaIcon,
			defaultRobot: robots.l_mega,
		},
	],
	[
		{
			saveAddress: "l_c++",
			name: "Leaphy C++",
			icon: cppIcon,
			defaultProgram: defaultCPP,
			mode: Mode.ADVANCED,
			defaultRobot: robots.l_uno,
		},
		{
			saveAddress: "l_micropython",
			name: "MicroPython",
			icon: microPythonIcon,
			mode: Mode.PYTHON,
			defaultProgram: defaultPython,
			defaultRobot: robots.l_nano_rp2040,
		},
	],
];

export function inFilter(robot: RobotDevice, filter: number[]) {
	if (filter.includes(-robot.type)) return false;

	return filter.includes(robot.type);
}

export interface Selector {
	name: string;
	robots: RobotDevice[];
}

export function getSelector(robot: RobotDevice): Selector[] {
	const NANO_SELECTOR: Selector[] = [
		{
			name: "Leaphy Original",
			robots: [
				robots.l_original_nano,
				robots.l_original_nano_esp32,
				robots.l_original_nano_rp2040,
			],
		},
		{
			name: "Arduino",
			robots: [robots.l_nano, robots.l_nano_esp32, robots.l_nano_rp2040],
		},
	];

	if (get(mode) === Mode.ADVANCED) {
		return [
			{
				name: "Leaphy",
				robots: [
					robots.l_flitz_uno,
					robots.l_flitz_nano,
					robots.l_original_uno,
					robots.l_original_nano,
					robots.l_original_nano_esp32,
					robots.l_original_nano_rp2040,
					robots.l_click,
				],
			},
			{
				name: "Arduino",
				robots: [
					robots.l_uno,
					robots.l_nano,
					robots.l_nano_esp32,
					robots.l_nano_rp2040,
					robots.l_mega,
				],
			},
		];
	}

	if (get(mode) === Mode.PYTHON) {
		return [
			{
				name: "Arduino",
				robots: [robots.l_nano_rp2040, robots.l_nano_esp32],
			},
		];
	}

	if (inFilter(robot, robotsGroups.L_ARDUINO_NANO_ALL)) {
		return NANO_SELECTOR;
	}

	if (inFilter(robot, robotsGroups.L_ORIGINAL_ALL)) {
		const originalSelector = [...NANO_SELECTOR].map((e) => ({ ...e }));
		originalSelector[0].robots.unshift(robots.l_original_uno);
		originalSelector[1].robots.unshift(robots.l_uno);

		return originalSelector;
	}

	if (inFilter(robot, [RobotType.L_UNO])) {
		return [
			{
				name: "Uno",
				robots: [robots.l_uno, robots.l_original_uno],
			},
		];
	}

	if (inFilter(robot, robotsGroups.L_FLITZ_ALL)) {
		return [
			{
				name: "Leaphy Flitz",
				robots: [robots.l_flitz_uno, robots.l_flitz_nano],
			},
		];
	}

	return null;
}
