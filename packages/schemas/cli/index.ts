import { mkdir, writeFile } from "node:fs/promises";
import * as readline from "node:readline";
import StreamZip from "node-stream-zip";
import { DOMParser } from "xmldom";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function prompt(question: string) {
	return new Promise<string>((resolve) => {
		rl.question(question, resolve);
	});
}

const file = process.argv[2];
const zip = new StreamZip.async({ file });

const entries = await zip.entries();
const partDataFile = Object.keys(entries).find((name) => name.endsWith(".fzp"));
if (!partDataFile)
	throw Error(
		"The provided file is not a valid Fritzing part (missing config)",
	);

const svgFile = Object.keys(entries).find(
	(name) => name.startsWith("svg.breadboard.") && name.endsWith(".svg"),
);
if (!svgFile)
	throw Error(
		"The provided file is not a valid Fritzing part (missing breadboard)",
	);

const partDataContent = await zip.entryData(partDataFile);
const partData = new DOMParser().parseFromString(partDataContent.toString());

function formatPins(pins: Record<string, string>) {
	return Object.entries(pins)
		.map(([key, value]) => `${key}: ${value}`)
		.join("\n");
}

const defaultPins = Array.from(partData.getElementsByTagName("connector"))
	.map((el) => ({
		name: el.getAttribute("name") || "",
		breadboardId:
			el
				.getElementsByTagName("breadboardView")[0]
				.getElementsByTagName("p")[0]
				.getAttribute("svgId") || "",
	}))
	.reduce(
		(prev, curr) => {
			prev[curr.name] = curr.breadboardId;

			return prev;
		},
		{} as Record<string, string>,
	);

const useDefaultPinMappings =
	await prompt(`The following pins were automatically identified:
${formatPins(defaultPins)}
Would you like to proceed with these pin mappings? (Y/N): `);

async function requestPinMappings() {
	const mappings = {} as Record<string, string>;
	while (true) {
		const pinID = await prompt(
			"Please enter a pin ID or enter DONE to finalize your mappings: ",
		);
		if (pinID.toUpperCase() === "DONE") break;

		mappings[pinID] = await prompt(
			"Please enter an SVG ID to link to this pin: ",
		);
	}

	return mappings;
}

const pinMappings =
	useDefaultPinMappings.toUpperCase() === "Y"
		? defaultPins
		: await requestPinMappings();

console.log(`You chose the following pin mappings:
${formatPins(pinMappings)}`);

await mkdir(process.argv[3]);
await writeFile(
	`${process.argv[3]}/index.ts`,
	`import schema from './schema.svg'\n\nexport default { schema, mappings: ${JSON.stringify(pinMappings)} }`,
);
await zip.extract(svgFile, `${process.argv[3]}/schema.svg`);

process.exit(0);
