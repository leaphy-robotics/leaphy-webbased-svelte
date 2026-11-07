import { importEasyEDA } from "./importEasyEDA";
import { importFritzing } from "./importFritzing";

const [file, directory] = process.argv.slice(2);
if (!file || !directory) {
	throw Error("Usage: pnpm run add <part.fzpz | pcb.json | pcbs.zip> <output>");
}

if (file.endsWith(".epro")) {
	throw Error(
		"EasyEDA Pro projects aren't supported, please export the PCB from EasyEDA Standard as EasyEDA source (.json)",
	);
}

if (file.endsWith(".json") || file.endsWith(".zip")) {
	await importEasyEDA(file, directory);
} else {
	await importFritzing(file, directory);
}

process.exit(0);
