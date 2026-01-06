import leaphyStarling from "$assets/robots/icons/l_starling.svg";
import assembly from "./assembly.svg";
import code from "./code.svg";
import ultrasonic from "./ultrasonic.svg";

export interface TutorialItem {
	name: string;
	video: string;
}

export interface Tutorial {
	name: string;
	item: TutorialItem[] | string;
}

const dutchTutorials: Tutorial[] = [
	{
		name: "Bouwen Leaphy Starling",
		item: [
			{
			  "name": "Stap 1 Vastzetten van de motoren",
			  "video": "dSjeNtmFMF8"
			},
			{
			  "name": "Stap 2 Vastzetten van de wielen",
			  "video": "vj7QEjyS5is"
			},
			{
			  "name": "Stap 3 Vastzetten van het frame",
			  "video": "SYgxEHDTl6o"
			},
			{
			  "name": "Stap 4 Vastzetten van de electronica",
			  "video": "JqjtGiUV-DM"
			},
			{
			  "name": "Stap 5 Vastzetten batterijhouder",
			  "video": "CUiXgtLRnP8"
			},
			{
			  "name": "Stap 6 Vastzetten computer",
			  "video": "PKirp8oF_90"
			},
			{
			  "name": "Stap 7 Vastzetten Ultrasoon",
			  "video": "HJABnvbLBnY"
			},
			{
			  "name": "Stap 8 Vastzetten Lichtsensoren",
			  "video": "uu5IbabW32E"
			},
			{
			  "name": "Stap 9 Vastzetten Lijnvolg sensoren",
			  "video": "nSRSzP814hU"
			},
			{
			  "name": "Stap 10 Vastzetten RGB lampje",
			  "video": "_NlqZXUzr2o"
			},
			{
			  "name": "Stap 11 Electronica aansluiten",
			  "video": "SYbJA4ns4Nk"
			}
		  ]
	},
	{
		name: "Inleiding Leaphy Tutorials",
		item: "SdzdW9EWqyc"
	},
	{
		name: "Inleiding Leaphy Murphy en Delphy shield",
		item: "bL2trk9mF6k"
	},
	{
		name: "Batterijen aansluiten",
		item: "J3ScoQvmhpo"
	},
	{
		name: "Verschillende leds",
		item: "hXcgCz6p-HM"
	},
	{
		name: "I2C sensor module",
		item: [
			{ name: "Deel 1", video: "lQzemlhglYI" },
			{ name: "Deel 2", video: "NBErZmx3CRE" }
		]
	},
	{
		name: "Ultrasoon sensor",
		item: [
			{ name: "Aansluiten", video: "i0KzLXeMB1A" },
			{ name: "Programmeren", video: "M-JJJRqTm9E" }
		]
	},
	{
		name: "Licht sensor",
		item: [
			{ name: "Aansluiten", video: "5gEUPiqRRkM" },
			{ name: "Programmeren", video: "q6Ka22fL2SI" }
		]
	},
	{
		name: "ToF sensor",
		item: [
			{ name: "Aansluiten", video: "RwBL6jCwtSA" },
			{ name: "Programmeren", video: "AREtgakBQi0" }
		]
	},
	{
		name: "Infrarood sensor",
		item: [
			{ name: "Aansluiten", video: "EZ_5YhDqyZ4" },
			{ name: "Programmeren", video: "d4P5zveR40c" }
		]
	},
	{
		name: "Omgevings sensor",
		item: [
			{ name: "Aansluiten", video: "sGbY752LYiw" },
			{ name: "Programmeren", video: "TkC34jBwEOQ" }
		]
	},
	{
		name: "Luchtdruksensor",
		item: [
			{ name: "Aansluiten", video: "JBUfu9tSwkQ" },
			{ name: "Programmeren", video: "LfW9TELp98g" }
		]
	},
	{
		name: "Piezo",
		item: [
			{ name: "Aansluiten", video: "PWYcKRQuvPw" },
			{ name: "Programmeren", video: "g5ZRA17VS0o" }
		]
	},
	{
		name: "Gas sensor",
		item: [
			{ name: "Aansluiten", video: "GqMfyBV8LS0" },
			{ name: "Programmeren", video: "vpGSoVq7pZo" }
		]
	},
	{
		name: "RGB Led",
		item: [
			{ name: "Aansluiten", video: "bqGnmGiuqyc" },
			{ name: "Programmeren", video: "SJbBohi2DiI" }
		]
	},
	{
		name: "Eenkleurige leds",
		item: [
			{ name: "Aansluiten", video: "5TPv7Js9gRI" },
			{ name: "Programmeren", video: "ceSBvmX9E0w" }
		]
	},
	{
		name: "TT motoren",
		item: [
			{ name: "Aansluiten", video: "adpjVscMvoA" },
			{ name: "Programmeren", video: "7STdA0hRdPE" }
		]
	},
	{
		name: "Servomotor",
		item: [
			{ name: "Aansluiten", video: "mz-Aphg6hDA" },
			{ name: "Programmeren", video: "SHMB_gmdUcw" }
		]
	},
	{
		name: "Roterende servo",
		item: [
			{ name: "Aansluiten", video: "I4fnZHUKC-w" },
			{ name: "Programmeren", video: "SZ-zESdLZko" }
		]
	},
	{
		name: "Segment display",
		item: [
			{ name: "Aansluiten", video: "s94HaiBN1K0" },
			{ name: "Programmeren", video: "vy1nFlVI9W4" }
		]
	},
	{
		name: "Oled display",
		item: [
			{ name: "Aansluiten", video: "8ffNLIf1Q1c" },
			{ name: "Programmeren", video: "guwc5vM6V_A" }
		]
	},
	{
		name: "Potmeter",
		item: [
			{ name: "Aansluiten", video: "lvxsBR7RlmI" },
			{ name: "Programmeren", video: "x32cxqokdhw" }
		]
	},
	{
		name: "Ledstrip en ledring",
		item: [
			{ name: "Aansluiten", video: "8BKNvGC37TM" },
			{ name: "Programmeren", video: "Ob6oM7IqW14" }
		]
	},
	{
		name: "Led matrix",
		item: [
			{ name: "Aansluiten", video: "lvxjHwb_fYA" },
			{ name: "Programmeren", video: "yJfdw-i0Who" }
		]
	},
	{
		name: "Speaker",
		item: [
			{ name: "Aansluiten", video: "2C1fhRZbXa4" },
			{ name: "Programmeren", video: "6y_sxQHf3dY" }
		]
	}
]

const englishTutorials: Tutorial[] = [
	{
		name: "Building Leaphy Starling",
		item: [
			{
			  "name": "Step 1. Attaching the motors",
			  "video": "QIsnMN-IATU"
			},
			{
			  "name": "Step 2. Connecting the wheels",
			  "video": "s8yRqKDul_8"
			},
			{
			  "name": "Step 3. Putting the frame together",
			  "video": "2dZxQjRrduA"
			},
			{
			  "name": "Step 4. Attaching the shield",
			  "video": "RRuu02SJltk"
			},
			{
			  "name": "Step 5.Connecting battery holder",
			  "video": "iemkOL-RHPI"
			},
			{
			  "name": "Step 6.Attaching the nano computer",
			  "video": "gEqgtBcTwEM"
			},
			{
			  "name": "Step 7. Connecting the ultrasonic sensor",
			  "video": "fkbP0jFy8lo"
			},
			{
			  "name": "Step 8. Attaching the light sensors",
			  "video": "rifI-YBHXQ8"
			},
			{
			  "name": "Step 9. Attaching the line sensors",
			  "video": "ckpt6lIJDd8"
			},
			{
			  "name": "Step 10. Connecting the RGB led",
			  "video": "RMLfb_DT9Xw"
			},
			{
			  "name": "Step 11. Wiring the electronics",
			  "video": "TcafgW-mHa0"
			}
		  ]
	},
	{
		name: "Introduction Leaphy Tutorials",
		item: "lWkcd9BDqmQ"
	},
	{
		name: "Leaphy Murphy and Delphy shield",
		item: "jeVymmo7Fs8"
	},
	{
		name: "How to use the pins on Leaphy shield",
		item: "lfd18TopY3w"
	},
	{
		name: "Batteries and power",
		item: "BmmOLhmYrs4"
	},
	{
		name: "I2C sensor module",
		item: "5s__7xrt-No"
	},
	{
		name: "Ultrasonic sensor",
		item: "3E49_uxERUo"
	},
	{
		name: "Light sensor",
		item: "mUZQ5ppuU3E"
	},
	{
		name: "ToF sensor",
		item: "CHcwRMOR7n8"
	},
	{
		name: "Infrared sensor",
		item: "4SdIcDCtioQ"
	},
	{
		name: "Ambient light sensor",
		item: "TKshAWKj4dA"
	},
	{
		name: "Barometer",
		item: "Odg0B8bvNMg"
	},
	{
		name: "Different types of leds",
		item: "AY5vHEwLUcM"
	},
	{
		name: "TT motors",
		item: "uEGQN5YPtSI"
	},
	{
		name: "Servo motors",
		item: "B0Tum9k9ZD0"
	},
	{
		name: "Rotating servo motor",
		item: "nMEB9Pkavwo"
	},
	{
		name: "Single leds",
		item: "b1PwN82DG7E"
	},
	{
		name: "Segment display",
		item: "TEHs2Yu1d-U"
	},
	{
		name: "Oled display",
		item: "o7auKZpVmc8"
	},
	{
		name: "RGB led",
		item: "YHYZTJ_YzP0"
	},
	{
		name: "Potmeter",
		item: "aGii_f0RDLk"
	},
	{
		name: "Multiple leds",
		item: "ogTVaCl_f-Y"
	},
	{
		name: "Led matrix",
		item: "Go8jqVs3zGc"
	},
	{
		name: "Speaker",
		item: "NLLHL0l8LPk"
	}
]

export default {
	nl: dutchTutorials,
	en: englishTutorials,
}
