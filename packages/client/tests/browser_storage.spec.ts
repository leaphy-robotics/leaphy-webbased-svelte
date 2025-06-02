import { expect, test } from "@playwright/test";
import { goToHomePage, openExample, selectRobot } from "./utils";

test.beforeEach(goToHomePage);

test("Saving - Backpack", async ({ page }) => {
	await selectRobot(page, "Leaphy Original", "Original Uno");
	await openExample(page, "Blink");

	// Put something in the backpack
	await page
		.getByText("repeat forever")
		.dragTo(page.locator(".blocklyBackpack"));

	// Check that its in the backpack
	await expect(page.getByText("repeat forever")).toBeHidden();
	await page.locator(".blocklyBackpack").click();
	await expect(page.getByText("repeat forever")).toBeVisible();

	// Start a new project, why not?
	await page.getByRole("button", { name: "My projects" }).click();
	await page.getByRole("cell", { name: "New" }).click();

	await page.reload();

	await page.getByText("Cancel").click();
	// Load a different robot type than before, cause why not
	await selectRobot(page, "Leaphy Starling", "Starling Nano");

	await expect(page.getByText("repeat forever")).toBeHidden();
	await page.locator(".blocklyBackpack").click();
	await expect(page.getByText("repeat forever")).toBeVisible();

	await page.getByText("repeat forever").dragTo(page.getByText("Leaphy"), {
		force: true,
		targetPosition: {
			x: 30,
			y: 30,
		},
	});

	// Check that the blocks have been loaded properly
	await page.locator(".side").first().click(); // Open code
	await expect(page.locator(".view-lines")).toContainText("delay(1000)");
});

test("Saving - Blockly", async ({ page }) => {
	await selectRobot(page, "Leaphy Original", "Original Uno");
	await openExample(page, "Blink");

	await page.reload();

	await page.getByText("Cancel").click();
	await selectRobot(page, "Leaphy Original", "Original Uno");
	await expect(page.getByText("repeat forever")).toBeVisible();
});

test("Saving - Blockly - Continue working", async ({ page }) => {
	await selectRobot(page, "Leaphy Original", "Original Uno");
	await openExample(page, "Blink");

	await page.reload();

	await page.getByText("Continue").and(page.getByRole("button")).click();
	await expect(page.getByText("repeat forever")).toBeVisible();
});

test("Saving - C++", async ({ page }) => {
	await selectRobot(page, "Leaphy C++");
	await page.getByText("setup").click();
	await page.getByLabel("Editor content").fill("testing");

	await expect(page.getByText("setup")).toBeHidden();
	await expect(page.getByText("testing")).toBeVisible();

	await page.reload();

	await page.getByText("Cancel").click();
	await selectRobot(page, "Leaphy C++");
	await expect(page.getByText("setup")).toBeHidden();
	await expect(page.getByText("testing")).toBeVisible();
});

test("Saving - C++ - Continue working", async ({ page }) => {
	await selectRobot(page, "Leaphy C++");
	await page.getByText("setup").click();
	await page.getByLabel("Editor content").fill("testing");

	await expect(page.getByText("setup")).toBeHidden();
	await expect(page.getByText("testing")).toBeVisible();

	await page.reload();

	await page.getByText("Continue").and(page.getByRole("button")).click();
	await expect(page.getByText("setup")).toBeHidden();
	await expect(page.getByText("testing")).toBeVisible();
});

test("Saving - New project", async ({ page }) => {
	await selectRobot(page, "Leaphy Original", "Original Uno");
	await openExample(page, "Blink");

	// Start a new project, should reset to the default
	await page.getByRole("button", { name: "My projects" }).click();
	await page.getByRole("cell", { name: "New" }).click();

	// Its a new project, it should not be here!
	await expect(page.getByText("repeat forever")).toBeHidden();
});
