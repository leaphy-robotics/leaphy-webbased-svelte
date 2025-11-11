import defaultCPP from "$assets/default-program.ino?raw";
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
	UNIFIED = 0,
	MEGA = 3,
	MICROPYTHON = 4,
}

const baseUno = {
	mapping: PinMapping.UNIFIED,
	fqbn: "arduino:avr:uno",
	programmer: new STK500v1(),
	board: "l_uno",
};

const baseNano = {
	mapping: PinMapping.UNIFIED,
	fqbn: "arduino:avr:nano",
	programmer: new STK500v1(),
	board: "l_nano",
};

const baseNanoESP32 = {
	mapping: PinMapping.UNIFIED,
	fqbn: "arduino:esp32:nano_nora",
	programmer: new DFU(),
	board: "l_nano_esp32",
};

const baseNanoRP2040 = {
	mapping: PinMapping.UNIFIED,
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
		id: "l_original",
		type: RobotType.L_ORIGINAL,
		name: "Leaphy Original",
		icon: originalIcon,
		background: originalUnoBackground,
	},
	{
		...baseNano,
		id: "l_starling",
		type: RobotType.L_STARLING,
		name: "Leaphy Starling",
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
		id: "l_micropython",
		type: RobotType.L_MICROPYTHON,
		name: "Leaphy Micropython",
		icon: microPythonIcon,
		programmer: null,
		fqbn: "n/a",
		board: "micropython",
		mapping: PinMapping.MICROPYTHON,
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
		robots.l_starling,
		robots.l_original,
	],
	[
		robots.l_nano,
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
		robots.l_micropython,
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
					robots.l_original,
					robots.l_starling,
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
