import { expect, test } from "@playwright/test";
import { goToHomePage, openExample, setupArduino } from "./utils";

test.beforeEach(setupArduino);
test.beforeEach(goToHomePage);

test("Arduino - upload", async ({ page }) => {
	await page.getByText("Leaphy Original").click();
	await page.getByText("Original Uno").click();

	await openExample(page, "Blink");

	await page.getByRole("button", { name: "Upload to robot" }).click();
	await expect(
		page.getByRole("heading", { name: "Robot update complete" }),
	).toBeVisible({
		timeout: 15000,
	});

	// Try it again :)
	await page.getByRole("button", { name: "Go back to editor" }).click();
	// await page.getByRole('button', { name: 'Upload to robot' }).click();
	// await expect(page.getByRole('heading', { name: 'Robot update complete' })).toBeVisible({
	// 	timeout: 15000
	// });
});
