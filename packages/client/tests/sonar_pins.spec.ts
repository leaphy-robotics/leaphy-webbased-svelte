import { expect, test } from "@playwright/test";
import { goToHomePage, selectRobot } from "./utils";

test.beforeEach(goToHomePage);

test("SonarPins", async ({ page }) => {
	await selectRobot(page, "Arduino Uno");
	await new Promise((resolve) => setTimeout(resolve, 1000));

	let values = page
		.locator(".blocklyDraggable")
		.filter({
			has: page.getByText("Get distance Trig"),
		})
		.first()
		.locator(".blocklyEditableField");

	expect(values.nth(0)).toHaveText("Default");
	expect(values.nth(1)).toHaveText("Default");
});
