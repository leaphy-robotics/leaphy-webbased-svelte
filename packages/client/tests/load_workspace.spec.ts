import { expect, test } from "@playwright/test";
import { goToHomePage, mockShowOpenFilePicker, selectRobot } from "./utils";

test.beforeEach(goToHomePage);

let test_files = [
	["Old Xml format", "hello_world_xml.l_original_uno"],
	["New Json format", "hello_world_json.l_original_uno"],
];

for (let [testName, file] of test_files) {
	test(`LoadAndSave - ${testName}`, async ({ page }) => {
		await selectRobot(page, "Leaphy Original");
		await page.getByRole("button", { name: "My projects" }).click();

		// Playwright doesn't seem to support `showOpenFilePicker()` so mock it
		let createOnWritePromise = await mockShowOpenFilePicker(
			page,
			`./tests/saved_workspaces/${file}`,
		);

		await page.getByRole("cell", { name: "Open" }).click();

		// All of these should be loaded in
		await expect(page.getByText("repeat")).toBeVisible();
		await expect(page.getByText("during")).toBeVisible();
		await expect(page.getByText("hello world!")).toBeVisible();
		await expect(page.getByText("10", { exact: true })).toBeVisible();

		// The code should have also been updated
		await page.locator(".side").first().click();

		await expect(page.locator(".view-lines")).toContainText("test = 10");
		await expect(page.locator(".view-lines")).toContainText("delay(1000)");
		await expect(page.locator(".view-lines")).toContainText('"hello world!"');

		// Save the project, it should write to the previously opened file!
		await page.getByRole("button", { name: "My projects" }).click();

		let onWritePromise = createOnWritePromise();
		await page.getByRole("cell", { name: "Save", exact: true }).click();
		let writtenChunks = await onWritePromise;
		expect(JSON.stringify(writtenChunks)).toContain("hello world"); // This is very hacky, but it works
	});
}
