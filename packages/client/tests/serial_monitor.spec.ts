import { expect, test } from "@playwright/test";
import { goToHomePage, selectRobot, setupArduino } from "./utils";

test.beforeEach(setupArduino);
test.beforeEach(goToHomePage);

test("Serial Monitor - Open and basic interactions", async ({ page }) => {
	await selectRobot(page, "Arduino Nano");

	// Open the Serial Monitor
	// The tooltip/span contains the translated text for "SERIAL_OUTPUT"
	// and it's inside a button.
	// "SERIAL_OUTPUT": "Show output on screen" in en.json
	await page
		.getByRole("button")
		.filter({ hasText: "Show output on screen" })
		.click();

	// Check if the Serial Monitor window is visible
	// It should have a title "Show output on screen"
	const windowTitle = page.locator("div.text-lg", {
		hasText: "Show output on screen",
	});
	await expect(windowTitle).toBeVisible();

	// Check if it shows "Not connected" since we haven't connected yet
	// "NOT_CONNECTED": "Not connected" in en.json
	await expect(page.getByText("Not connected", { exact: true })).toBeVisible();
});
