import { expect, test } from "@playwright/test";
import { goToHomePage, openExample, selectRobot, setupArduino } from "./utils";

test.describe.configure({ mode: "serial" });

test.beforeEach(setupArduino);
test.beforeEach(goToHomePage);

test.fixme("Arduino - Blockly upload", async ({ page }) => {
	await selectRobot(page, "Leaphy Original", "Original Uno");
	await openExample(page, "Blink");

	await page.getByRole("button", { name: "Upload to robot" }).click();
	await expect(
		page.getByRole("button", { name: "Go back to editor" }),
	).toBeVisible({
		timeout: 15000,
	});
	await expect(
		page.getByRole("heading", { name: "Robot update complete" }),
	).toBeVisible({
		timeout: 50, // It should already be visible
	});
});

test.fixme("Arduino - C++ upload", async ({ page }) => {
	await selectRobot(page, "Leaphy C++");
	await page.getByRole("button", { name: "Upload to robot" }).click();
	await expect(
		page.getByRole("button", { name: "Go back to editor" }),
	).toBeVisible({
		timeout: 15000,
	});
	await expect(
		page.getByRole("heading", { name: "Robot update complete" }),
	).toBeVisible({
		timeout: 50, // It should already be visible
	});
});

// Help debug errors in the above tests
test.afterEach(async ({ page }) => {
	await page.evaluate(
		"console.log(JSON.stringify(window.avrdudeLog, null, 4))",
	);
});
