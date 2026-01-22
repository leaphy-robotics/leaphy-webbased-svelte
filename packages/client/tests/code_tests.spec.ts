import { promises as fs, existsSync as fileExists } from "node:fs";
import { type Page, expect, test } from "@playwright/test";
import {
	getDownloadContents,
	goToHomePage,
	mockShowOpenFilePicker,
	selectRobot,
} from "./utils";

test.beforeEach(goToHomePage);

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

async function GetAllWorkspaceFiles(extension: string): Promise<string[]> {
	let code_tests_path = "./tests/code_tests";
	if (!fileExists("./tests/code_tests")) {
		code_tests_path = "./packages/client/tests/code_tests";
	}

	let allFiles = await getAllFiles(code_tests_path);

	return allFiles.filter((str) => str.endsWith(extension));
}

async function testLibraries(
	uploadedLibraries: string[],
	workspace_file: string,
) {
	// Remove version information, "Servo@1.1.1" -> "Servo"
	const unversionedLibraries = uploadedLibraries.map(
		(lib) => lib.split("@")[0],
	);

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

async function testCode(generatedCode: string, workspace_file: string) {
	let code = (await fs.readFile(`${workspace_file}_code`)).toString();

	for (const segment of code.split("\n\n")) {
		// Create a regex of the segment instead of directly searching for the segment so whitespace becomes optional
		let escaped = segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		let whitespace = escaped.replace(/(\s)+/g, "\\s*");
		let regex = new RegExp(`${whitespace}`);

		expect(generatedCode).toMatch(regex);
	}
}

async function downloadCode(page: Page): Promise<string> {
	await page.locator(".header").getByRole("button", { name: "Code" }).click();
	await page.getByRole("button", { name: "My projects" }).click();

	await page.getByRole("cell", { name: "Save As" }).click();

	await page
		.getByRole("textbox", { name: "Give your download a name" })
		.fill("Test");
	const downloadPromise = page.waitForEvent("download");
	await page.locator("form").getByRole("button", { name: "Save" }).click();
	const download = await getDownloadContents(downloadPromise);

	await page.getByRole("button", { name: "Blocks" }).click();

	return download;
}

async function testCppExtension(page: Page, extension: string) {
	// Make the serial check fail instantly instead of causing a popup on the browser
	await page.evaluate("navigator.serial.requestPort = async function() { }");

	// Prevent the compilation requests from actually doing anything, the request needs to be inspected, the output is tested elsewhere for correctness.
	await page.route("**/compile/cpp*", (route) => {
		route.abort("failed");
	});

	let num_tests = 0;

	for (const workspace_file of await GetAllWorkspaceFiles(extension)) {
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
		await testCode(await downloadCode(page), workspace_file);
	}

	expect(num_tests).toBeGreaterThan(0);
}

const CppRobotTypes = [
	{
		robot: "Leaphy Flitz",
		model: undefined,
		extension: ".l_flitz_nano",
	},
	{
		robot: "Leaphy Starling",
		model: undefined,
		extension: ".l_starling",
	},
	{
		robot: "Leaphy Original",
		model: undefined,
		extension: ".l_original",
	},
	{
		robot: "Arduino Nano",
		model: undefined,
		extension: ".l_nano",
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

for (const { robot, model, extension } of CppRobotTypes) {
	test(`Code blocks - ${model ? model : robot}`, async ({ page }) => {
		await selectRobot(page, robot, model);
		await testCppExtension(page, extension);
	});
}

// Micropython works in a very different way than Cpp, so it has to get its own test
test("Code blocks - Micropython", async ({ page }) => {
	await selectRobot(page, "Leaphy Micropython");

	let num_tests = 0;

	for (const workspace_file of await GetAllWorkspaceFiles(".l_micropython")) {
		console.log(`Running test: ${workspace_file}`);
		num_tests += 1;

		await page.getByRole("button", { name: "My projects" }).click();

		await mockShowOpenFilePicker(page, workspace_file);

		await page.getByRole("cell", { name: "Open" }).click();

		let downloadedCode = await downloadCode(page);

		await testCode(downloadedCode, workspace_file);
	}

	expect(num_tests).toBeGreaterThan(0);
});
