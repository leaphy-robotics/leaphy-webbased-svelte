import defaultCPP from "$assets/default-program.ino?raw";
import defaultPython from "$assets/default-program.py?raw";
import flitzNanoBackground from "$assets/robots/backgrounds/flitz_nano.svg";
import flitzUnoBackground from "$assets/robots/backgrounds/flitz_uno.svg";
import originalNanoBackground from "$assets/robots/backgrounds/orig_nano.svg";
import originalNanoESP32Background from "$assets/robots/backgrounds/orig_nano_esp32.svg";
import originalNanoRP2040Background from "$assets/robots/backgrounds/orig_nano_rp2040.svg";
import originalUnoBackground from "$assets/robots/backgrounds/orig_uno.svg";
import cppIcon from "$assets/robots/icons/l_c++.svg";
import flitzIcon from "$assets/robots/icons/l_flitz.svg";
import megaIcon from "$assets/robots/icons/l_mega.svg";
import microPythonIcon from "$assets/robots/icons/l_micropython.svg";
import nanoIcon from "$assets/robots/icons/l_nano.svg";
import originalIcon from "$assets/robots/icons/l_original.svg";
import starlingIcon from "$assets/robots/icons/l_starling.svg";
import unoIcon from "$assets/robots/icons/l_uno.svg";
import WorkspaceState, { Mode } from "$state/workspace.svelte";
import DFU from "../programmers/DFU";
import Pico from "../programmers/Pico";
import STK500v1 from "../programmers/STK500v1/STK500v1";
import STK500v2 from "../programmers/STK500v2";
import { type Programmer, RobotType } from "./robots.types";

interface BaseRobot {
	name: string;
	icon: string;
	id: string;
}

export interface RobotDevice extends BaseRobot {
	type: number;
	mapping: PinMapping;
	programmer: Programmer;
	fqbn: string;
	background?: string;
	board: string;
}

interface RobotListingVariants extends BaseRobot {
	variants: Robot[][];
}

interface RobotListingMode extends BaseRobot {
	robot: RobotDevice;
	defaultProgram?: string;
	mode?: (typeof Mode)[keyof typeof Mode];
}

export type RobotListing = RobotListingVariants | RobotListingMode;
export type Robot = RobotListing | RobotDevice;

export enum PinMapping {
	UNO = 0,
	NANO = 1,
	MEGA = 2,
}

const baseUno = {
	mapping: PinMapping.UNO,
	fqbn: "arduino:avr:uno",
	programmer: new STK500v1(),
	board: "l_uno",
};

const baseNano = {
	mapping: PinMapping.NANO,
	fqbn: "arduino:avr:nano",
	programmer: new STK500v1(),
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
		type: RobotType.L_FLITZ_UNO,
		name: "Flitz Uno",
		icon: flitzIcon,
		background: flitzUnoBackground,
	},
	{
		...baseNano,
		id: "l_flitz_nano",
		type: RobotType.L_FLITZ_NANO,
		name: "Flitz Nano",
		icon: flitzIcon,
		background: flitzNanoBackground,
	},
	{
		...baseUno,
		id: "l_original_uno",
		type: RobotType.L_ORIGINAL_UNO,
		name: "Original Uno",
		icon: originalIcon,
		background: originalUnoBackground,
	},
	{
		...baseNano,
		id: "l_original_nano",
		type: RobotType.L_ORIGINAL_NANO,
		name: "Original Nano",
		icon: originalIcon,
		background: originalNanoBackground,
	},
	{
		...baseNanoESP32,
		id: "l_original_nano_esp32",
		type: RobotType.L_ORIGINAL_NANO_ESP32,
		name: "Original Nano ESP32",
		icon: originalIcon,
		background: originalNanoESP32Background,
	},
	{
		...baseNanoRP2040,
		id: "l_original_nano_rp2040",
		type: RobotType.L_ORIGINAL_NANO_RP2040,
		name: "Original Nano RP2040",
		icon: originalIcon,
		background: originalNanoRP2040Background,
	},
	{
		...baseNano,
		id: "l_starling_nano",
		type: RobotType.L_STARLING_NANO,
		name: "Starling Nano",
		icon: starlingIcon,
	},
	{
		...baseNanoESP32,
		id: "l_starling_nano_esp32",
		type: RobotType.L_STARLING_NANO_ESP32,
		name: "Starling Nano ESP32",
		icon: starlingIcon,
	},
	{
		...baseNanoRP2040,
		id: "l_starling_nano_rp2040",
		type: RobotType.L_STARLING_NANO_RP2040,
		name: "Starling Nano RP2040",
		icon: starlingIcon,
	},
	{
		...baseNano,
		id: "l_nano",
		type: RobotType.L_NANO,
		name: "Arduino Nano",
		icon: nanoIcon,
	},
	{
		...baseNanoESP32,
		id: "l_nano_esp32",
		type: RobotType.L_NANO_ESP32,
		name: "Arduino Nano ESP32",
		icon: nanoIcon,
	},
	{
		...baseNanoRP2040,
		id: "l_nano_rp2040",
		type: RobotType.L_NANO_RP2040,
		name: "Arduino Nano RP2040",
		icon: nanoIcon,
	},
	{
		...baseNanoRP2040,
		id: "l_nano_rp2040_python",
		type: RobotType.L_NANO_RP2040_MICROPYTHON,
		name: "Arduino Nano RP2040 (python)",
		libraries: [],
		icon: nanoIcon,
	},
	{
		...baseUno,
		id: "l_uno",
		type: RobotType.L_UNO,
		name: "Arduino Uno",
		icon: unoIcon,
	},
	{
		id: "l_mega",
		type: RobotType.L_MEGA,
		mapping: PinMapping.MEGA,
		name: "Arduino Mega",
		programmer: new STK500v2(),
		fqbn: "arduino:avr:mega",
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

export const robotListing: Robot[][] = [
	[
		{
			id: "l_flitz_select",
			name: "Leaphy Flitz",
			icon: flitzIcon,
			variants: [[robots.l_flitz_uno, robots.l_flitz_nano]],
		},
		{
			id: "l_starling_select",
			name: "Leaphy Starling",
			icon: starlingIcon,
			variants: [
				[robots.l_starling_nano],
				[robots.l_starling_nano_esp32, robots.l_starling_nano_rp2040],
			],
		},
		{
			id: "l_original_select",
			name: "Leaphy Original",
			icon: originalIcon,
			variants: [
				[robots.l_original_uno, robots.l_original_nano],
				[robots.l_original_nano_esp32, robots.l_original_nano_rp2040],
			],
		},
	],
	[
		{
			id: "l_nano_select",
			name: "Arduino Nano",
			icon: nanoIcon,
			variants: [
				[robots.l_nano, robots.l_nano_rp2040_python],
				[robots.l_nano_esp32, robots.l_nano_rp2040],
			],
		},
		robots.l_uno,
		robots.l_mega,
	],
	[
		{
			id: "l_cpp",
			name: "Leaphy C++",
			icon: cppIcon,
			defaultProgram: defaultCPP,
			mode: Mode.ADVANCED,
			robot: robots.l_uno,
		},
		{
			id: "l_micropython",
			name: "MicroPython",
			icon: microPythonIcon,
			mode: Mode.PYTHON,
			defaultProgram: defaultPython,
			robot: robots.l_nano_rp2040,
		},
	],
];

export function inFilter(robot: RobotDevice, filter: number[]) {
	if (filter.includes(-robot.type)) return false;

	return filter.includes(robot.type);
}

export interface Selector {
	id: string;
	name: string;
	robots: RobotDevice[];
}

export function getSelector(): Selector[] {
	if (WorkspaceState.Mode === Mode.ADVANCED) {
		return [
			{
				id: "leaphy",
				name: "Leaphy",
				robots: [
					robots.l_flitz_uno,
					robots.l_flitz_nano,
					robots.l_original_uno,
					robots.l_original_nano,
					robots.l_original_nano_esp32,
					robots.l_original_nano_rp2040,
					robots.l_starling_nano,
					robots.l_starling_nano_esp32,
					robots.l_starling_nano_rp2040,
				],
			},
			{
				id: "arduino",
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

	return null;
}
