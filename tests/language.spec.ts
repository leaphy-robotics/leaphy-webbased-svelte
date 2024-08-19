import { type Page, expect, test } from "@playwright/test";
import { goToHomePage, openExample, selectRobot } from "./utils";

test.beforeEach(goToHomePage);

test("Language", async ({ page }) => {
	await page.getByRole("button", { name: "MicroPython MicroPython" }).click();
	await page.getByRole("button", { name: "More..." }).click();
	await page.getByRole("cell", { name: "Language" }).click();
	await page.getByRole("cell", { name: "Nederlands" }).click();
	await page.getByRole("button", { name: "Mijn projecten" }).click();
	await page.getByRole("cell", { name: "Nieuw" }).click();
	await selectRobot(page, "Leaphy Original", "Original Nano ESP32", "Ga door");
	await expect(page.getByText("Lees afstand")).toBeVisible();
	await expect(page.getByText("Lees anapin")).toBeVisible();
	await expect(page.getByText("Lees gas")).toBeVisible();
	await expect(page.getByText("Lees luchtdruk")).toBeVisible();
	await page.locator("#l_numbers").click();
	await expect(page.getByText("willekeurig getal van")).toBeVisible();
	await expect(page.getByText("niet")).toBeVisible();
	await page.getByText("even", { exact: true }).click();
	await page.getByText("priemgetal").click();
	await page.getByRole("button", { name: "Opslaan" }).click();
	await expect(page.getByPlaceholder("Geef een bestandsnaam")).toBeVisible();
	await page.getByRole("button", { name: "Annuleer" }).click();

	// Prevent it from opening a popup requesting the port, act as if nothing gets selected
	await page.evaluate("navigator.serial.requestPort = function() {}");
	await page.getByRole("button", { name: "Upload naar robot" }).click();
	await page.getByRole("button", { name: "Ga terug naar code scherm" }).click();
});
