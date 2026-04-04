import type { RobotDevice } from "$domain/robots";
import { inFilter } from "$domain/robots";
import robotsGroups from "$domain/robots.groups";
import { RobotType } from "$domain/robots.types";

export interface TutorialItem {
	name: string;
	video: string;
}

export interface Tutorial {
	name: string;
	robots: number[];
	item: TutorialItem[] | string;
}

const dutchTutorials: Tutorial[] = [
	{
		name: "Bouwen Leaphy Starling",
		robots: [RobotType.L_STARLING],
		item: [
			{
				name: "Stap 1 Vastzetten van de motoren",
				video: "dSjeNtmFMF8",
			},
			{
				name: "Stap 2 Vastzetten van de wielen",
				video: "vj7QEjyS5is",
			},
			{
				name: "Stap 3 Vastzetten van het frame",
				video: "SYgxEHDTl6o",
			},
			{
				name: "Stap 4 Vastzetten van de electronica",
				video: "JqjtGiUV-DM",
			},
			{
				name: "Stap 5 Vastzetten batterijhouder",
				video: "CUiXgtLRnP8",
			},
			{
				name: "Stap 6 Vastzetten computer",
				video: "PKirp8oF_90",
			},
			{
				name: "Stap 7 Vastzetten Ultrasoon",
				video: "HJABnvbLBnY",
			},
			{
				name: "Stap 8 Vastzetten Lichtsensoren",
				video: "uu5IbabW32E",
			},
			{
				name: "Stap 9 Vastzetten Lijnvolg sensoren",
				video: "nSRSzP814hU",
			},
			{
				name: "Stap 10 Vastzetten RGB lampje",
				video: "_NlqZXUzr2o",
			},
			{
				name: "Stap 11 Electronica aansluiten",
				video: "SYbJA4ns4Nk",
			},
		],
	},
	{
		name: "Bouwen Leaphy Original",
		robots: [RobotType.L_ORIGINAL],
		item: [
			{
				name: "Stap 1: Vastzetten van de motoren",
				video: "NEyQ7lier5c",
			},
			{
				name: "Stap 2: Vastzetten van de wielen",
				video: "bNMsulixuoI",
			},
			{
				name: "Stap 3: Vastzetten van het frame",
				video: "HKH1tyzhbNg",
			},
			{
				name: "Stap 4: Vastzetten van de batterijhouder",
				video: "Dzq1hGwKKak",
			},
			{
				name: "Stap 5: Vastzetten shield",
				video: "D9rMlIijiLo",
			},
			{
				name: "Stap 6: Motoren aansluiten op shield",
				video: "72W1hptz_jw",
			},
			{
				name: "Stap 7: Aansluiten batterijhouder",
				video: "yrcl0tNjw58",
			},
			{
				name: "Stap 8: Vastzetten Lijnvolgers",
				video: "c5N1zgcTRgM",
			},
			{
				name: "Stap 9: Vastzetten Lichtsensoren",
				video: "hhZAGPMuHA4",
			},
			{
				name: "Stap 10: Vastzetten RGB lampje",
				video: "Hu_KEU5HLvM",
			},
			{
				name: "Stap 11: Nano aansluiten",
				video: "OPW8b0nsUlo",
			},
			{
				name: "Stap 12: Ultrasoon sensor aansluiten",
				video: "v5ClmiOS_mg",
			},
			{
				name: "Stap 13: Staartsleutel vastzetten",
				video: "a9w-0J9rMWk",
			},
		],
	},
	{
		name: "Programmeren Leaphy Original",
		robots: [RobotType.L_ORIGINAL],
		item: [
			{
				name: "Level 1: Introductie Leaphy Easybloqs",
				video: "i14O2vfNH30",
			},
			{
				name: "Level 2: Ultrasoon sensor",
				video: "nLx8vUwj3uI",
			},
			{
				name: "Level 2: Lichtshow",
				video: "RPfrJh-A6N4",
			},
			{
				name: "Level 2: Motor controle",
				video: "-7Zrcv3Kx8E",
			},
			{
				name: "Level 3: Kleurendobbelsteen",
				video: "3M6XOGd23dA",
			},
			{
				name: "Level 3: Kleurengolf",
				video: "A8fOjkVgmRo",
			},
			{
				name: "Level 4: Lijnvolgen",
				video: "hIDFF1fDAvU",
			},
			{
				name: "Level 5: Lichtsensoren",
				video: "EdPc2vf30E4",
			},
		],
	},
	{
		name: "Bouwen Leaphy Flitz",
		robots: [RobotType.L_FLITZ_NANO],
		item: [
			{
				name: "Wat zit er in de doos?",
				video: "tJk1BWmhnl0",
			},
			{
				name: "Leaphy Flitz bouwen",
				video: "RRHAr6jlJQA",
			},
		],
	},
	{
		name: "Programmeren Leaphy Flitz",
		robots: [RobotType.L_FLITZ_UNO, RobotType.L_FLITZ_NANO],
		item: [
			{
				name: "Flitz kleuren programmeren",
				video: "52ldsQwuPYM",
			},
			{
				name: "Buiksensor programmeren",
				video: "BQT4F5676YM",
			},
			{
				name: "Hand sensor programmeren",
				video: "GdxozQs8ZbY",
			},
		],
	},
	{
		name: "Inleiding Leaphy Tutorials",
		robots: robotsGroups.ALL,
		item: "SdzdW9EWqyc",
	},
	{
		name: "Bouwen Leaphy Factory",
		robots: [RobotType.L_NANO],
		item: [
			{
				name: "The Control Hub",
				video: "kjRlCZJwK4A",
			},
			{
				name: "3-DOF Manipulator",
				video: "8ir6B702JjY",
			},
			{
				name: "The Conveyor Belt",
				video: "LgayK-wsAXs",
			},
			{
				name: "Andon Light",
				video: "PXsDXvJxKvk",
			},
		],
	},
	{
		name: "Inleiding Leaphy Murphy en Delphy shield",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "bL2trk9mF6k",
	},
	{
		name: "Batterijen aansluiten",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "J3ScoQvmhpo",
	},
	{
		name: "Verschillende leds",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "hXcgCz6p-HM",
	},
	{
		name: "I2C sensor module",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Deel 1", video: "lQzemlhglYI" },
			{ name: "Deel 2", video: "NBErZmx3CRE" },
		],
	},
	{
		name: "Ultrasoon sensor",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "i0KzLXeMB1A" },
			{ name: "Programmeren", video: "M-JJJRqTm9E" },
		],
	},
	{
		name: "Licht sensor",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "5gEUPiqRRkM" },
			{ name: "Programmeren", video: "q6Ka22fL2SI" },
		],
	},
	{
		name: "ToF sensor",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "RwBL6jCwtSA" },
			{ name: "Programmeren", video: "AREtgakBQi0" },
		],
	},
	{
		name: "Infrarood sensor",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "EZ_5YhDqyZ4" },
			{ name: "Programmeren", video: "d4P5zveR40c" },
		],
	},
	{
		name: "Omgevings sensor",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "sGbY752LYiw" },
			{ name: "Programmeren", video: "TkC34jBwEOQ" },
		],
	},
	{
		name: "Luchtdruksensor",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "JBUfu9tSwkQ" },
			{ name: "Programmeren", video: "LfW9TELp98g" },
		],
	},
	{
		name: "Piezo",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "PWYcKRQuvPw" },
			{ name: "Programmeren", video: "g5ZRA17VS0o" },
		],
	},
	{
		name: "Gas sensor",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "GqMfyBV8LS0" },
			{ name: "Programmeren", video: "vpGSoVq7pZo" },
		],
	},
	{
		name: "RGB Led",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "bqGnmGiuqyc" },
			{ name: "Programmeren", video: "SJbBohi2DiI" },
		],
	},
	{
		name: "Eenkleurige leds",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "5TPv7Js9gRI" },
			{ name: "Programmeren", video: "ceSBvmX9E0w" },
		],
	},
	{
		name: "TT motoren",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "adpjVscMvoA" },
			{ name: "Programmeren", video: "7STdA0hRdPE" },
		],
	},
	{
		name: "Servomotor",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "mz-Aphg6hDA" },
			{ name: "Programmeren", video: "SHMB_gmdUcw" },
		],
	},
	{
		name: "Roterende servo",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "I4fnZHUKC-w" },
			{ name: "Programmeren", video: "SZ-zESdLZko" },
		],
	},
	{
		name: "Segment display",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "s94HaiBN1K0" },
			{ name: "Programmeren", video: "vy1nFlVI9W4" },
		],
	},
	{
		name: "Oled display",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "8ffNLIf1Q1c" },
			{ name: "Programmeren", video: "guwc5vM6V_A" },
		],
	},
	{
		name: "Potmeter",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "lvxsBR7RlmI" },
			{ name: "Programmeren", video: "x32cxqokdhw" },
		],
	},
	{
		name: "Ledstrip en ledring",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "8BKNvGC37TM" },
			{ name: "Programmeren", video: "Ob6oM7IqW14" },
		],
	},
	{
		name: "Led matrix",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "lvxjHwb_fYA" },
			{ name: "Programmeren", video: "yJfdw-i0Who" },
		],
	},
	{
		name: "Speaker",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: [
			{ name: "Aansluiten", video: "2C1fhRZbXa4" },
			{ name: "Programmeren", video: "6y_sxQHf3dY" },
		],
	},
];

const englishTutorials: Tutorial[] = [
	{
		name: "Building Leaphy Starling",
		robots: [RobotType.L_STARLING],
		item: [
			{
				name: "Step 1. Attaching the motors",
				video: "QIsnMN-IATU",
			},
			{
				name: "Step 2. Connecting the wheels",
				video: "s8yRqKDul_8",
			},
			{
				name: "Step 3. Putting the frame together",
				video: "2dZxQjRrduA",
			},
			{
				name: "Step 4. Attaching the shield",
				video: "RRuu02SJltk",
			},
			{
				name: "Step 5.Connecting battery holder",
				video: "iemkOL-RHPI",
			},
			{
				name: "Step 6.Attaching the nano computer",
				video: "gEqgtBcTwEM",
			},
			{
				name: "Step 7. Connecting the ultrasonic sensor",
				video: "fkbP0jFy8lo",
			},
			{
				name: "Step 8. Attaching the light sensors",
				video: "rifI-YBHXQ8",
			},
			{
				name: "Step 9. Attaching the line sensors",
				video: "ckpt6lIJDd8",
			},
			{
				name: "Step 10. Connecting the RGB led",
				video: "RMLfb_DT9Xw",
			},
			{
				name: "Step 11. Wiring the electronics",
				video: "TcafgW-mHa0",
			},
		],
	},
	{
		name: "Building Leaphy Original",
		robots: [RobotType.L_ORIGINAL],
		item: [
			{
				name: "Step 1. Attaching the motors",
				video: "iEsCwRMnMsQ",
			},
			{
				name: "Step 2. Connecting the wheels",
				video: "_Gx1kIgLb1I",
			},
			{
				name: "Step 3. Putting the frame together",
				video: "6Q5d7S2GCYs",
			},
			{
				name: "Step 4. Attaching the battery holder",
				video: "2sagwNvQjdo",
			},
			{
				name: "Step 5. Connecting the shield",
				video: "B5suiqBWRRg",
			},
			{
				name: "Step 6. Attaching the motors",
				video: "7loksPLC7QQ",
			},
			{
				name: "Step 7. Connecting the batteryholder",
				video: "K8tbY7eQPkY",
			},
			{
				name: "Step 8. Attaching the line followers",
				video: "X-UvbuvaY20",
			},
			{
				name: "Step 9. Attaching the light sensors",
				video: "6FPQu1tWPSw",
			},
			{
				name: "Step 10. Connecting the RGB led",
				video: "BNiXYCcDOPg",
			},
			{
				name: "Step 11. Connecting the nano computer",
				video: "UO7T408jqek",
			},
			{
				name: "Step 12. Connecting the ultrasone sensor",
				video: "nD4VvTaSwQM",
			},
			{
				name: "Step 13. Connecting the tail key",
				video: "XkOlXtpx_uc",
			},
		],
	},
	{
		name: "Programming Leaphy Original",
		robots: [RobotType.L_ORIGINAL],
		item: [
			{
				name: "Light show (Workbook level 2)",
				video: "Pkn7HDV7VjA",
			},
			{
				name: "Distance sensor (Workbook level 2)",
				video: "GaUioXxLIjA",
			},
			{
				name: "Motor control (Workbook level 2)",
				video: "tS-ytc9QVkI",
			},
			{
				name: "Color dice (Workbook level 3)",
				video: "bj5j1LpcKws",
			},
			{
				name: "Color wave (Workbook level 3)",
				video: "8WA9EGKbG5I",
			},
			{
				name: "Line tracking (Workbook level 4)",
				video: "7Z5imiSUPTs",
			},
			{
				name: "Light sensors (Workbook level 5)",
				video: "sMPM52o-Iy8",
			},
		],
	},
	{
		name: "Building Leaphy Flitz",
		robots: [RobotType.L_FLITZ_NANO],
		item: [
			{
				name: "What's in the box?",
				video: "tJk1BWmhnl0",
			},
			{
				name: "Building Leaphy Flitz",
				video: "08sLN-dmB6c",
			},
		],
	},
	{
		name: "Introduction Leaphy Tutorials",
		robots: robotsGroups.ALL,
		item: "lWkcd9BDqmQ",
	},
	{
		name: "Leaphy Murphy and Delphy shield",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "jeVymmo7Fs8",
	},
	{
		name: "How to use the pins on Leaphy shield",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "lfd18TopY3w",
	},
	{
		name: "Batteries and power",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "BmmOLhmYrs4",
	},
	{
		name: "I2C sensor module",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "5s__7xrt-No",
	},
	{
		name: "Ultrasonic sensor",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "3E49_uxERUo",
	},
	{
		name: "Light sensor",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "mUZQ5ppuU3E",
	},
	{
		name: "ToF sensor",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "CHcwRMOR7n8",
	},
	{
		name: "Infrared sensor",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "4SdIcDCtioQ",
	},
	{
		name: "Ambient light sensor",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "TKshAWKj4dA",
	},
	{
		name: "Barometer",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "Odg0B8bvNMg",
	},
	{
		name: "Different types of leds",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "AY5vHEwLUcM",
	},
	{
		name: "TT motors",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "uEGQN5YPtSI",
	},
	{
		name: "Servo motors",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "B0Tum9k9ZD0",
	},
	{
		name: "Rotating servo motor",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "nMEB9Pkavwo",
	},
	{
		name: "Single leds",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "b1PwN82DG7E",
	},
	{
		name: "Segment display",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "TEHs2Yu1d-U",
	},
	{
		name: "Oled display",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "o7auKZpVmc8",
	},
	{
		name: "RGB led",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "YHYZTJ_YzP0",
	},
	{
		name: "Potmeter",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "aGii_f0RDLk",
	},
	{
		name: "Multiple leds",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "ogTVaCl_f-Y",
	},
	{
		name: "Led matrix",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "Go8jqVs3zGc",
	},
	{
		name: "Speaker",
		robots: robotsGroups.ALL_BUT_FLITZ,
		item: "NLLHL0l8LPk",
	},
];

export function getTutorials(locale: string, robot: RobotDevice) {
	const tutorials = locale === "nl" ? dutchTutorials : englishTutorials;
	return tutorials.filter((tutorial) => inFilter(robot, tutorial.robots));
}
