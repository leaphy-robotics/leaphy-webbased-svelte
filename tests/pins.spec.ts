import { type Page, expect, test } from "@playwright/test";
import { goToHomePage, selectRobot } from "./utils";

test.beforeEach(goToHomePage);

let uno_pins = {
	digitalPinRange: [2, 19],
	analogPinRange: [0, 5],
	pwm: [3, 5, 6, 9, 10, 11],
};

let nano_pins = {
	digitalPinRange: [2, 19],
	analogPinRange: [0, 7],
	pwm: [3, 5, 6, 9, 10, 11],
};
let mega_pins = {
	digitalPinRange: [2, 53],
	analogPinRange: [0, 15],
	pwm: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
};

async function expect_dropdown_options(
	page: Page,
	expected: string[],
): Promise<void> {
	let items = page
		.locator("div.blocklyDropDownContent")
		.locator("div.blocklyMenuItem");

	for (let i = 0; i < expected.length; i++) {
		await expect(items.nth(i)).toHaveText(expected[i]);
	}
	await expect(items.nth(expected.length)).not.toBeVisible();
}

async function open_dropdown(page: Page, text: string) {
	await page
		.locator("g.blocklyDraggable")
		.filter({
			has: page.getByText(text),
		})
		.first()
		.locator(".blocklyEditableText")
		.filter({
			has: page.locator(".blocklyDropdownText"),
		})
		.click();
}

async function test_pins(
	page: Page,
	pins: {
		digitalPinRange: number[];
		analogPinRange: number[];
		pwm: number[];
	},
) {
	await open_dropdown(page, "Read digipin");
	let options: string[] = [];
	for (let i = pins.digitalPinRange[0]; i <= pins.digitalPinRange[1]; i++) {
		options.push(i.toString());
	}
	await expect_dropdown_options(page, options);
	await page.locator(".blocklyMainBackground").click(); // close dropdown

	await open_dropdown(page, "Read anapin");
	options = [];
	for (let i = pins.analogPinRange[0]; i <= pins.analogPinRange[1]; i++) {
		options.push(`A${i}`);
	}
	await expect_dropdown_options(page, options);
	await page.locator(".blocklyMainBackground").click(); // close dropdown

	await page.getByText("Actuators").click({
		force: true,
	});

	await open_dropdown(page, "Set PWM pin");
	await expect_dropdown_options(
		page,
		pins.pwm.map((i) => i.toString()),
	);
}

test("Pins - Uno", async ({ page }) => {
	await page.getByText("Leaphy Click").click();

	await test_pins(page, uno_pins);
});

test("Pins - Nano", async ({ page }) => {
	await selectRobot(page, "Arduino Nano", "Arduino Nano ESP32");

	await test_pins(page, nano_pins);
});

test("Pins - Mega", async ({ page }) => {
	await page.getByText("Arduino Mega").click();

	await test_pins(page, mega_pins);
});
