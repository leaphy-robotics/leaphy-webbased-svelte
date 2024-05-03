import { test, expect } from '@playwright/test';
import { goToHomePage } from './utils';
import consumers from "stream/consumers";

test.beforeEach(goToHomePage);

test("Load Blink example and check code", async ({ page }) => {
  await page.getByText("Leaphy Original").click();
  await page.getByText("Original Uno").click();

  // Open the blink example
  await page.getByRole("button", { name: "My projects" }).click();
  await page.getByRole('cell', { name: 'Examples' }).click();
  await page.getByRole('button', { name: 'Blink' }).click();

  await page.locator('.side').first().click();  // Open code

  // Check code
  await expect(page.locator(".view-lines")).toContainText(
    "digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000);", // check the important part about blink
  );

  // Modify delay to 500
  await page
    .getByLabel("Blockly Workspace")
    .getByText("1000")
    .first()
    .click();
  await page.locator("input").fill("500");
  await page.getByLabel("Blockly Workspace").getByText("1000").last().click(); // Use last as in headless mode it still finds the first one for some reason
  await page.locator("input").fill("500");

  // Check that the delays have been updated accordingly
  await expect(page.locator(".view-lines")).toContainText(
    "delay(500); digitalWrite(13, LOW); delay(500);",
  );

  // Save the robot
  await page.getByRole("button", { name: "Save" }).click();
  await page
    .getByPlaceholder("Give your download a name")
    .fill("MyModifiedBlink");
  
  const downloadPromise = page.waitForEvent("download");
  await page.locator('form').getByRole('button', { name: 'Save' }).click();
  const download = await downloadPromise;

  // Check filename
  expect(download.suggestedFilename()).toBe("MyModifiedBlink.l_original_uno");

  // Check that the delay is now 500
  const data = await consumers.text(await download.createReadStream());
  expect(data).toContain('"fields":{"NUM":500}');
});