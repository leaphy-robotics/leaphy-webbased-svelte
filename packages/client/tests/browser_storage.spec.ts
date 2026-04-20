import { expect, test } from "@playwright/test";
import { goToHomePage, openCode, openExample, selectRobot } from "./utils";

test.beforeEach(goToHomePage);

test("Saving - Backpack", async ({ page }) => {
	await selectRobot(page, "Leaphy Original");
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
	await page.getByText("New").click();

	await page.reload();

	await page.getByText("Cancel").click();
	// Load a different robot type than before, cause why not
	await selectRobot(page, "Leaphy Starling");

	await expect(page.getByText("repeat forever")).toBeHidden();
	await page.locator(".blocklyBackpack").click();
	await expect(page.getByText("repeat forever")).toBeVisible();

	await page
		.getByText("repeat forever")
		.dragTo(page.getByText("Leaphy", { exact: true }), {
			force: true,
			targetPosition: {
				x: 30,
				y: 30,
			},
		});

	// Check that the blocks have been loaded properly
	await openCode(page);
	await expect(page.locator(".view-lines")).toContainText("delay(1000)");
});

test("Saving - Blockly", async ({ page }) => {
	await selectRobot(page, "Leaphy Original");
	await openExample(page, "Blink");
	await expect(page.getByText("repeat forever")).toBeVisible();

	await page.reload();

	await page.getByText("Cancel").click();
	await selectRobot(page, "Leaphy Original");
	await expect(page.getByText("repeat forever")).toBeVisible();
});

test("Saving - Blockly - Continue working", async ({ page }) => {
	await selectRobot(page, "Leaphy Original");
	await openExample(page, "Blink");
	await expect(page.getByText("repeat forever")).toBeVisible();

	await page.reload();

	await page
		.getByRole("button", {
			name: "Leaphy Original Leaphy Original Temporary save",
		})
		.click();
	await page.getByText("Continue").and(page.getByRole("button")).click();
	await expect(page.getByText("repeat forever")).toBeVisible();
});

test("Saving - C++", async ({ page }) => {
	await selectRobot(page, "Leaphy C++");
	await page.getByText("setup").click();

	const editorContent = page.locator(".view-lines");
	await editorContent.waitFor({ state: "visible" });
	await editorContent.click();

	await page.keyboard.press("Control+A");
	await page.keyboard.press("Delete");
	await page.keyboard.type("testing");

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

	const editorContent = page.locator(".view-lines");
	await editorContent.waitFor({ state: "visible" });
	await editorContent.click();

	await page.keyboard.press("Control+A");
	await page.keyboard.press("Delete");
	await page.keyboard.type("testing");

	await expect(page.getByText("setup")).toBeHidden();
	await expect(page.getByText("testing")).toBeVisible();

	await page.reload();

	await page.getByText("C++ - Arduino Uno").click();
	await page.getByText("Continue").and(page.getByRole("button")).click();
	await expect(page.getByText("setup")).toBeHidden();
	await expect(page.getByText("testing")).toBeVisible();
});

test("Saving - New project", async ({ page }) => {
	await selectRobot(page, "Leaphy Original");
	await openExample(page, "Blink");

	// Start a new project, should reset to the default
	await page.getByRole("button", { name: "My projects" }).click();
	await page.getByText("New").click();

	// Its a new project, it should not be here!
	await expect(page.getByText("repeat forever")).toBeHidden();
});
