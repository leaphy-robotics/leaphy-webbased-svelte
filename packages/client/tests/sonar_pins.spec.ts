import { expect, test } from "@playwright/test";
import { timeout } from "@xterm/xterm/src/vs/base/common/async";
import { goToHomePage, selectRobot } from "./utils";

test.beforeEach(goToHomePage);

test("SonarPins", async ({ page }) => {
	await selectRobot(page, "Arduino Uno");
	await new Promise((resolve) => setTimeout(resolve, 5000));

	let values = page
		.locator(".blocklyDraggable")
		.filter({
			has: page.getByText("Get distance Trig"),
		})
		.first()
		.locator(".blocklyEditableField");

	expect(values.nth(0)).toHaveText("Default", { timeout: 10000 });
	expect(values.nth(1)).toHaveText("Default", { timeout: 10000 });
});
