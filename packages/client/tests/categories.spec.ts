import { expect, type Page, test } from "@playwright/test";
import { goToHomePage, selectRobot } from "./utils";

test.beforeEach(goToHomePage);

async function testCategories(
	page: Page,
	expectedCategories: [string, string][],
) {
	for (const category of expectedCategories) {
		const name = await page.locator(`#${category[0]}`).textContent();
		expect(name).toContain(category[1]);
	}
}

async function installExtension(page: Page, name: string) {
	await page.locator(".blocklyToolboxCategoryGroup button").click();
	await page.getByText("Select", { exact: true }).click();

	const extension = page
		.locator("div[aria-label='extension']")
		.filter({ hasText: name })
		.first();
	await extension.getByText("Add Extension").click();
}

test("Categories - Leaphy Flitz", async ({ page }) => {
	await selectRobot(page, "Leaphy Flitz", "Flitz Nano");
	await testCategories(page, [
		["l_search", "Search"],
		["l_flitz_nano", "Leaphy Flitz"],
		["l_situation", "Thinkflow"],
		["l_numbers", "Numbers"],
		["l_variables", "Variables"],
		["l_functions", "Custom Blocks"],
	]);
});

test("Categories - Leaphy Starling (with Lists)", async ({ page }) => {
	await selectRobot(page, "Leaphy Starling");
	await installExtension(page, "Lists");
	await testCategories(page, [
		["l_search", "Search"],
		["l_sensors", "Sensors"],
		["l_actuators", "Actuators"],
		["l_situation", "Thinkflow"],
		["l_numbers", "Numbers"],
		["l_variables", "Variables"],
		["l_lists", "Lists"],
		["l_functions", "Custom Blocks"],
	]);
});

test("Categories - Leaphy Original (with Operators)", async ({ page }) => {
	await selectRobot(page, "Leaphy Original");
	await installExtension(page, "Operators");
	await testCategories(page, [
		["l_search", "Search"],
		["l_sensors", "Sensors"],
		["l_actuators", "Actuators"],
		["l_situation", "Thinkflow"],
		["l_operators", "Operators"],
		["l_variables", "Variables"],
		["l_functions", "Custom Blocks"],
	]);
});
