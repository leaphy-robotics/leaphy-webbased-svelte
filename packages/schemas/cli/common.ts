import { mkdir, writeFile } from "node:fs/promises";
import * as readline from "node:readline";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

export function prompt(question: string) {
	return new Promise<string>((resolve) => {
		rl.question(question, resolve);
	});
}

function formatPins(pins: Record<string, string>) {
	return Object.entries(pins)
		.map(([key, value]) => `${key}: ${value}`)
		.join("\n");
}

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

/** Asks the user to confirm the identified pins, or to enter their own mappings */
export async function confirmPinMappings(defaultPins: Record<string, string>) {
	const useDefaultPinMappings =
		await prompt(`The following pins were automatically identified:
${formatPins(defaultPins)}
Would you like to proceed with these pin mappings? (Y/N): `);

	const pinMappings =
		useDefaultPinMappings.toUpperCase() === "Y"
			? defaultPins
			: await requestPinMappings();

	console.log(`You chose the following pin mappings:
${formatPins(pinMappings)}`);

	return pinMappings;
}

export async function createComponent(
	directory: string,
	pinMappings: Record<string, string>,
) {
	await mkdir(directory);
	await writeFile(
		`${directory}/index.ts`,
		`import schema from './schema.svg'\n\nexport default { schema, mappings: ${JSON.stringify(pinMappings)} }`,
	);
}
