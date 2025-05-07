import { type Page, expect, test } from "@playwright/test";
import { goToHomePage, newProject, selectRobot } from "./utils";

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

test("SonarPins", async ({ page }) => {
	await selectRobot(page, "Arduino Uno");
	await test_sonar_pins(page, "7", "8");

	await newProject(page);
	await selectRobot(page, "Arduino Nano", "Arduino Nano ESP32");
	await test_sonar_pins(page, "17", "16");

	await newProject(page);
	await selectRobot(page, "Leaphy Original", "Original Nano");
	await test_sonar_pins(page, "17", "16");

	await newProject(page);
	await selectRobot(page, "Leaphy Starling", "Starling Nano");
	await test_sonar_pins(page, "17", "16");
});
