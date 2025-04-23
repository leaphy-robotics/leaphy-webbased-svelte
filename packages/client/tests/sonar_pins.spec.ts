import { type Page, expect, test } from "@playwright/test";
import { goToHomePage, selectRobot } from "./utils";

test.beforeEach(goToHomePage);

async function test_sonar_pins(
	page: Page,
	first_pin: string,
	second_pin: string,
) {
	let values = page
		.locator(".blocklyDraggable")
		.filter({
			has: page.getByText("Get distance Trig"),
		})
		.first()
		.locator(".blocklyEditableText");

	expect(values.nth(0)).toHaveText(first_pin);
	expect(values.nth(1)).toHaveText(second_pin);
}

test("Pins - Uno", async ({ page }) => {
	await selectRobot(page, "Arduino Uno");

	await test_sonar_pins(page, "8", "7");
});

test("Pins - Nano", async ({ page }) => {
	await selectRobot(page, "Arduino Nano", "Arduino Nano ESP32");

	await test_sonar_pins(page, "17", "16");
});
