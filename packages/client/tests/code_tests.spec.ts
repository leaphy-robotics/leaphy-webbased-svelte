import { promises as fs, existsSync as fileExists } from "node:fs";
import { type Page, expect, test } from "@playwright/test";
import {
	getDownloadContents,
	goToHomePage,
	mockShowOpenFilePicker,
	selectRobot,
} from "./utils";

test.beforeEach(goToHomePage);

async function testLibraries(uploadedLibraries: string[], workspace_file: string) {
	// Remove version information, "Servo@1.1.1" -> "Servo"
	const unversionedLibraries = uploadedLibraries.map((lib) => lib.split("@")[0]);

	const libraryFile = `${workspace_file}_libraries`;
	// if (!fileExists(LibraryFile)) {
	// 	await fs.writeFile(LibraryFile, uploadedLibraries.join("\n"));
	// }

	let expectedLibraries = (await fs.readFile(libraryFile))
		.toString()
		.split("\n")
		.filter((lib) => lib.trim() !== "");

	for (const library of expectedLibraries) {
		expect(unversionedLibraries).toContain(library);
	}

	expect(expectedLibraries.length).toBe(unversionedLibraries.length);
}

async function testCode(uploadedCode: string, workspace_file: string) {
	let code = (await fs.readFile(`${workspace_file}_code`)).toString();

	for (const segment of code.split("\n\n")) {
		// Create a regex of the segment instead of directly searching for the segment so whitespace becomes optional
		let escaped = segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		let whitespace = escaped.replace(/(\s)+/g, "\\s*");
		let regex = new RegExp(`${whitespace}`);

		expect(uploadedCode).toMatch(regex);
	}
}

async function testDownloadMatchesUpload(page: Page, uploadedCode: string) {
	await page
		.locator(".header")
		.getByRole("button", { name: "Code" })
		.click();
	await page.getByRole("button", { name: "My projects" }).click();

	await page.getByRole("cell", { name: "Save As" }).click();

	await page
		.getByRole("textbox", { name: "Give your download a name" })
		.fill("Test");
	const downloadPromise = page.waitForEvent("download");
	await page
		.locator("form")
		.getByRole("button", { name: "Save" })
		.click();
	const download = await getDownloadContents(downloadPromise);

	await page.getByRole("button", { name: "Blocks" }).click();

	expect(uploadedCode).toBe(download);
}

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

	// Make the serial check fail instantly instead of causing a popup on the browser
	await page.evaluate("navigator.serial.requestPort = async function() { }");

	// Prevent the compilation requests from actually doing anything, the request needs to be inspected, the output is tested elsewhere for correctness.
	await page.route("**/compile/cpp*", (route) => {
		route.abort("failed");
	});

	let num_tests = 0;
	let has_tested_download = false;

	for (const workspace_file of files) {
		if (!workspace_file.endsWith(extension)) {
			continue;
		}

		console.log(`Running test: ${workspace_file}`);
		num_tests += 1;

		await page.getByRole("button", { name: "My projects" }).click();

		await mockShowOpenFilePicker(page, workspace_file);

		await page.getByRole("cell", { name: "Open" }).click();

		// To figure out what libraries are used, compile the project and capture the request
		const uploadPromise = page.waitForRequest((request) => {
			if (!/.*\/compile\/cpp/.test(request.url())) {
				return false;
			}

			return true;
		});

		await page.getByRole("button", { name: "Upload to robot" }).click();
		await page.getByRole("button", { name: "Go back to editor" }).click();

		const uploadInfo = await uploadPromise;
		const postData = JSON.parse(uploadInfo.postData() as string);

		await testLibraries(postData.libraries as string[], workspace_file);
		await testCode(postData.source_code as string, workspace_file);

		// Only the first time test if downloading gives the same result as it is almost 4x slower than reading the post request
		if (!has_tested_download) {
			has_tested_download = true;
			await testDownloadMatchesUpload(page, postData.source_code as string);
		}
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
