import { promises as fs } from "node:fs";
import { type Page, expect, test } from "@playwright/test";
import { goToHomePage, mockShowOpenFilePicker, openExample } from "./utils";

test.beforeEach(goToHomePage);

async function testExtension(page: Page, extension: string) {
	await page.getByRole("button", { name: "Code" }).nth(1).click();

	const files = await fs.readdir("./tests/code_tests");
	for (const workspace_file of files) {
		if (!workspace_file.endsWith(extension)) {
			continue;
		}

		await page.getByRole("button", { name: "My projects" }).click();

		await mockShowOpenFilePicker(page, `./tests/code_tests/${workspace_file}`);

		await page.getByRole("cell", { name: "Open" }).click();

		let code = (
			await fs.readFile(`./tests/code_tests/${workspace_file}_code`)
		).toString();

		for (const line of code.split("\n")) {
			await expect(page.locator(".view-lines")).toContainText(line);
		}
	}
}

test("Code blocks - Leaphy Click", async ({ page }) => {
	await page.getByText("Leaphy Click").click();
	await testExtension(page, ".l_click");
});

test("Code blocks - Original Uno", async ({ page }) => {
	await page.getByText("Leaphy Original").click();
	await page.getByText("Original Uno").click();

	await testExtension(page, ".l_original_uno");
});

test("Code blocks - Flitz Uno", async ({ page }) => {
	await page.getByText("Leaphy Flitz").click();
	await page.getByText("Flitz Uno").click();

	await testExtension(page, ".l_flitz_uno");
});
