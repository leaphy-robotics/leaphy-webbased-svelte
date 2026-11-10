import { DOMParser } from "@xmldom/xmldom";
import StreamZip from "node-stream-zip";
import { confirmPinMappings, createComponent } from "./common";

export async function importFritzing(file: string, directory: string) {
	const zip = new StreamZip.async({ file });

	const entries = await zip.entries();
	const partDataFile = Object.keys(entries).find((name) =>
		name.endsWith(".fzp"),
	);
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
	const partData = new DOMParser().parseFromString(
		partDataContent.toString(),
		"text/xml",
	);

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

	const pinMappings = await confirmPinMappings(defaultPins);

	await createComponent(directory, pinMappings);
	await zip.extract(svgFile, `${directory}/schema.svg`);
}
