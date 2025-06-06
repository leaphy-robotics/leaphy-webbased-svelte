import { promises as fs, existsSync as fileExists } from "node:fs";
import { type Page, expect, test } from "@playwright/test";
import {
	getDownloadContents,
	goToHomePage,
	mockShowOpenFilePicker,
	selectRobot,
} from "./utils";

test.beforeEach(goToHomePage);

async function testExtension(page: Page, extension: string) {
	async function getAllFiles(dir: string): Promise<string[]> {
		let entries = await fs.readdir(dir, { withFileTypes: true });
		let files = entries
			.filter((file) => !file.isDirectory())
			.map((file) => `${dir}/${file.name}`);
		let folders = entries.filter((folder) => folder.isDirectory());

		for (const folder of folders) {
			files = files.concat(await getAllFiles(`${dir}/${folder.name}`));
		}

		return files;
	}

	let path = "./tests/code_tests";
	if (!fileExists("./tests/code_tests")) {
		path = "./packages/client/tests/code_tests";
	}
	let files = await getAllFiles(path);

	let num_tests = 0;

	for (const workspace_file of files) {
		if (!workspace_file.endsWith(extension)) {
			continue;
		}

		console.log(`Running test: ${workspace_file}`);
		num_tests += 1;

		await page.getByRole("button", { name: "My projects" }).click();

		await mockShowOpenFilePicker(page, workspace_file);

		await page.getByRole("cell", { name: "Open" }).click();

		let code = (await fs.readFile(`${workspace_file}_code`)).toString();

		await page.locator(".header").getByRole("button", { name: "Code" }).click();
		await page.getByRole("button", { name: "My projects" }).click();

		await page.getByRole("cell", { name: "Save As" }).click();

		await page
			.getByRole("textbox", { name: "Give your download a name" })
			.fill("Test");
		const downloadPromise = page.waitForEvent("download");
		await page.locator("form").getByRole("button", { name: "Save" }).click();
		const download = await getDownloadContents(downloadPromise);

		for (const segment of code.split("\n\n")) {
			// Create a regex of the segment instead of directly searching for the segment so whitespace becomes optional
			let escaped = segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			let whitespace = escaped.replace(/(\s)+/g, "\\s*");
			let regex = new RegExp(`${whitespace}`);

			expect(download).toMatch(regex);
		}

		await page.getByRole("button", { name: "Blocks" }).click();
	}

	expect(num_tests).toBeGreaterThan(0);
}

// TODO: Import all robot types from robots.ts and figure out how to make it work with the enums
const robotTypes = [
	{
		robot: "Leaphy Flitz",
		model: "Flitz Uno",
		extension: ".l_flitz_uno",
	},
	{
		robot: "Leaphy Starling",
		model: "Starling Nano",
		extension: ".l_starling_nano",
	},
	{
		robot: "Leaphy Starling",
		model: "Starling Nano ESP32",
		extension: ".l_starling_nano_esp32",
	},
	{
		robot: "Leaphy Original",
		model: "Original Uno",
		extension: ".l_original_uno",
	},
	{
		robot: "Leaphy Original",
		model: "Original Nano ESP32",
		extension: ".l_original_nano_esp32",
	},
	{
		robot: "Arduino Nano",
		model: "Arduino Nano ESP32",
		extension: ".l_nano_esp32",
	},
	{
		robot: "Arduino Uno",
		model: undefined,
		extension: ".l_uno",
	},
	{
		robot: "Arduino Mega",
		model: undefined,
		extension: ".l_mega",
	},
];

for (const { robot, model, extension } of robotTypes) {
	test(`Code blocks - ${model ? model : robot}`, async ({ page }) => {
		await selectRobot(page, robot, model);
		await testExtension(page, extension);
	});
}
