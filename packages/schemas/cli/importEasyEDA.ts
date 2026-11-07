import { readFile, writeFile } from "node:fs/promises";
import StreamZip from "node-stream-zip";
import { confirmPinMappings, createComponent, prompt } from "./common";
import { convertEasyEDA, getDocumentType } from "./easyeda";

/** Project exports are a zip of JSON documents, of which only the PCBs are usable */
async function readDocumentFromZip(file: string) {
	const zip = new StreamZip.async({ file });
	const entries = await zip.entries();

	const pcbs: { name: string; document: unknown }[] = [];
	for (const name of Object.keys(entries)) {
		if (!name.endsWith(".json")) continue;

		try {
			const document = JSON.parse((await zip.entryData(name)).toString());
			if (getDocumentType(document) === "3") pcbs.push({ name, document });
		} catch {
			// Other JSON files in the archive aren't EasyEDA documents
		}
	}
	await zip.close();

	if (!pcbs.length) {
		throw Error("The provided archive does not contain an EasyEDA PCB");
	}
	if (pcbs.length === 1) return pcbs[0].document;

	const choice = await prompt(`The archive contains multiple PCBs:
${pcbs.map(({ name }, index) => `${index + 1}: ${name}`).join("\n")}
Which one would you like to import? `);
	const pcb = pcbs[Number(choice) - 1];
	if (!pcb) throw Error(`${choice} is not one of the listed PCBs`);

	return pcb.document;
}

export async function importEasyEDA(file: string, directory: string) {
	const document = file.endsWith(".zip")
		? await readDocumentFromZip(file)
		: JSON.parse(await readFile(file, "utf8"));

	const { svg, pins, otherPads, warnings } = convertEasyEDA(document);
	warnings.forEach((warning) => {
		console.warn(`Warning: ${warning}`);
	});

	if (otherPads.length) {
		console.log(`The following pads are available for custom mappings:
${otherPads.map(({ label, svgId }) => `${label}: ${svgId}`).join("\n")}
`);
	}

	const pinMappings = await confirmPinMappings(
		Object.fromEntries(pins.map(({ name, svgId }) => [name, svgId])),
	);

	await createComponent(directory, pinMappings);
	await writeFile(`${directory}/schema.svg`, svg);
}
