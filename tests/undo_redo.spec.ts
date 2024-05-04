import { test, expect } from "@playwright/test";
import { goToHomePage, openExample as loadExample } from "./utils";

test.beforeEach(goToHomePage);

test("Undo redo - Deletion", async ({ page }) => {
	await page.getByText("Leaphy Original").click();
	await page.getByText("Original Uno").click();

	await loadExample(page, "blink");

	// Delete the repeat forever block
	await page.getByText("repeat forever").click();
	await page.locator("svg").filter({ hasText: "Leaphy" }).press("Delete");
	await expect(page.getByText("repeat forever")).toBeHidden();

	await page.locator("div:nth-child(2) > button").first().click(); // Click undo button
	await expect(page.getByText("repeat forever")).toBeVisible();
	await page.locator("div:nth-child(2) > button:nth-child(2)").click(); // Click redo button
	await expect(page.getByText("repeat forever")).toBeHidden();
	await page.keyboard.press("Control+z");
	await expect(page.getByText("repeat forever")).toBeVisible();
	await page.keyboard.press("Control+y");
	await expect(page.getByText("repeat forever")).toBeHidden();
});

test("Undo redo - Variable change", async ({ page }) => {
	await page.getByText("Leaphy Original").click();
	await page.getByText("Original Uno").click();

	await loadExample(page, "blink");

	// Change a boolean
	await page.getByText('true').click();
	await page.locator('#blockly-1').getByText('false').click();
	await expect(page.getByText('false')).toHaveCount(2);
	await page.keyboard.press("Control+z");
	await expect(page.getByText('false')).toHaveCount(1);
	await page.keyboard.press("Control+y");
	await expect(page.getByText('false')).toHaveCount(2);

	// Change one of the delays
	await page.getByText('1000').first().click();
	await page.getByRole('textbox').fill('123');
	await expect(page.getByText('123', { exact: true })).toBeVisible();
	await page.keyboard.press("Control+z");
	await expect(page.getByText('123', { exact: true })).toBeHidden();
	await page.keyboard.press("Control+y");
	await expect(page.getByText('123', { exact: true })).toBeVisible();
	
	await page.getByRole('textbox').press('Enter');
	await expect(page.getByText('123', { exact: true })).toBeVisible();
	await page.keyboard.press("Control+z");
	await expect(page.getByText('123', { exact: true })).toBeHidden();
	await page.keyboard.press("Control+y");
	await expect(page.getByText('123', { exact: true })).toBeVisible();
});
