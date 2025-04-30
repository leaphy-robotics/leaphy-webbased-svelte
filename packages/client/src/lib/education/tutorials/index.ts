import leaphyOriginal from "$assets/robots/icons/l_original.svg";
import assembly from "./assembly.svg";
import code from "./code.svg";
import ultrasonic from "./ultrasonic.svg";

export type Translation<Type = string> = Record<string, Type>;
export type Video = Translation<string | [string, string][]>;

export interface TutorialItem {
	name: Translation;
	icon: string;
	video: Video;
}

export interface Tutorial {
	name: Translation;
	icon: string;
	item: TutorialItem[] | Video;
}

const tutorials: Tutorial[] = [
	{
		name: {
			en: "Leaphy Starling",
			nl: "Leaphy Starling",
		},
		icon: leaphyOriginal,
		item: {
			en: [
				["QIsnMN-IATU", "1 Leaphy Starling Attaching the motors"],
				["s8yRqKDul_8", "2 Leaphy Starling: Attaching the wheels"],
				["2dZxQjRrduA", "3 Leaphy Starling Attaching the frame"],
				["RRuu02SJltk", "4 Leaphy Starling Attaching electronics"],
				["iemkOL-RHPI", "5 Leaphy Starling Battery holder"],
				["gEqgtBcTwEM", "6 Leaphy Starling Attaching the computer"],
				["fkbP0jFy8lo", "7 Leaphy Starling Ultrasonic sensor"],
				["rifI-YBHXQ8", "8 Leaphy Starling Light sensors"],
				["ckpt6lIJDd8", "9 Leaphy Starling Line sensors"],
				["RMLfb_DT9Xw", "10 Leaphy Starling RGB Light"],
				["TcafgW-mHa0", "11 Leaphy Starling Wiring the electronics"],
			],
			nl: [
				["dSjeNtmFMF8", "Stap 1 Bouwen Leaphy Starling: Motoren vastzetten"],
				["vj7QEjyS5is", "Stap 2 Bouwen Leaphy Starling: Wielen vastzetten"],
				["SYgxEHDTl6o", "Stap 3 Bouwen Leaphy Starling: Frame vastzetten"],
				[
					"JqjtGiUV-DM",
					"Stap 4 Bouwen Leaphy Starling: Elektronica vastzetten",
				],
				[
					"CUiXgtLRnP8",
					"Stap 5 Bouwen Leaphy Starling: Batterijhouder vastzetten",
				],
				["PKirp8oF_90", "Stap 6 Bouwen Leaphy Starling: Computer vastzetten"],
				[
					"HJABnvbLBnY",
					"Stap 7 Bouwen Leaphy Starling: Ultrasone sensor vastzetten",
				],
				[
					"uu5IbabW32E",
					"Stap 8 Bouwen Leaphy Starling: Lichtsensoren vastzetten",
				],
				[
					"nSRSzP814hU",
					"Stap 9 Bouwen Leaphy Starling: Lijnvolg sensoren vastzetten",
				],
				[
					"_NlqZXUzr2o",
					"Stap 10 Bouwen Leaphy Starling: RGB lampje vastzetten",
				],
				[
					"SYbJA4ns4Nk",
					"Stap 11 Bouwen Leaphy Starling: Elektronica aansluiten",
				],
			],
		},
	},
	{
		name: {
			en: "Leaphy Original",
			nl: "Leaphy Original",
		},
		icon: leaphyOriginal,
		item: [
			{
				name: {
					en: "Assembly",
					nl: "Bouwen",
				},
				icon: assembly,
				video: {
					en: [
						["iEsCwRMnMsQ", "1 Leaphy Original: Attaching the motors"],
						["_Gx1kIgLb1I", "2 Leaphy original: Connecting the wheels"],
						["6Q5d7S2GCYs", "3 Leaphy original Putting the frame together"],
						["2sagwNvQjdo", "4 Leaphy original: Attaching the battery holder"],
						["B5suiqBWRRg", "5 Leaphy original: Connecting the shield"],
						[
							"7loksPLC7QQ",
							"6 Leaphy original Attaching the motors to the motor shield",
						],
						[
							"K8tbY7eQPkY",
							"7 Leaphy original Connecting the batteryholder to the shield",
						],
						["X-UvbuvaY20", "8 Leaphy original Attaching the line followers"],
						["6FPQu1tWPSw", "9 Leaphy original Attaching the light sensors"],
						["BNiXYCcDOPg", "10 Leaphy original Connecting the RGB Led"],
						["UO7T408jqek", "11 Leaphy original Connecting the nano computer"],
						[
							"nD4VvTaSwQM",
							"12 Leaphy original Connecting the ultrasonic sensor",
						],
						["XkOlXtpx_uc", "13 Leaphy original Connecting the tail key"],
					],
					nl: [
						[
							"NEyQ7lier5c",
							"Stap 1 Bouwfilm Leaphy Original: Motoren vastzetten",
						],
						[
							"bNMsulixuoI",
							"Stap 2 Bouwfilm Leaphy Original: Wielen vastzetten",
						],
						[
							"HKH1tyzhbNg",
							"Stap 3 Bouwfilm Leaphy original: Frame vastzetten",
						],
						[
							"Dzq1hGwKKak",
							"Stap 4 Bouwfilm Leaphy original: Batterijhouder vastzetten",
						],
						[
							"D9rMlIijiLo",
							"Stap 5 Bouwfilm Leaphy original: Shield vastzetten",
						],
						[
							"72W1hptz_jw",
							"stap 6 Bouwfilm Leaphy original: Motoren aan shield vastzetten",
						],
						[
							"yrcl0tNjw58",
							"Stap 7 Bouwfilms Leaphy original: Batterijhouder aansluiten",
						],
						[
							"c5N1zgcTRgM",
							"Stap 8 Bouwfilm Leaphy original: lijnvolgers aansluiten",
						],
						[
							"hhZAGPMuHA4",
							"Stap 9 Bouwfilm Leaphy original: lichtsensoren aansluiten",
						],
						[
							"OPW8b0nsUlo",
							"Stap 11 Bouwfilm Leaphy original: Nano aansluiten",
						],
						[
							"v5ClmiOS_mg",
							"Stap 12 Bouwfilm Leaphy original: ultrasoon aansluiten",
						],
						[
							"a9w-0J9rMWk",
							"Stap 13 Bouwfilm Leaphy original: staartsleutel vastzetten",
						],
						[
							"Hu_KEU5HLvM",
							"Stap 10 Bouwfilm Leaphy original: RGB Led aansluiten",
						],
					],
				},
			},
			{
				name: {
					en: "Programming",
					nl: "Programmeren",
				},
				icon: code,
				video: {
					nl: [
						[
							"i14O2vfNH30",
							"Level 1 introductie in het werken met Leaphy Easybloqs",
						],
						[
							"nLx8vUwj3uI",
							"Level 2 Leaphy original De ultrasoon sensor: afstandsensor",
						],
						["-7Zrcv3Kx8E", "Level 2 Leaphy original Motorcontrole"],
						["3M6XOGd23dA", "Level 3 Leaphy original Kleurendobbelsteen"],
						["A8fOjkVgmRo", "Level 3 Leaphy original Kleurengolf"],
						["hIDFF1fDAvU", "Level 4 Leaphy original Lijnvolgen"],
						["EdPc2vf30E4", "Level 5 Leaphy original Lichtsensoren"],
					],
				},
			},
		],
	},
	{
		name: {
			en: "",
			nl: "Ultrasonic sensor",
		},
		icon: ultrasonic,
		item: {
			en: "",
			nl: "M-JJJRqTm9E",
		},
	},
];

export default tutorials;
