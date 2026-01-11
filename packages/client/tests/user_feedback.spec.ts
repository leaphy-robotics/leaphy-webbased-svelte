import { expect, test } from "@playwright/test";
import { goToHomePage, selectRobot } from "./utils";

test.beforeEach(goToHomePage);

test("User Feedback", async ({ page }) => {
	await selectRobot(page, "Leaphy Starling");

	await page.getByRole("button", { name: "Tips" }).click();
	await page.getByRole("cell", { name: "Suggestion / Feedback" }).click();
	await page.getByPlaceholder("Your name...").fill("test");
	await page.getByPlaceholder("Email").fill("test@ing");
	await page.locator("textarea").fill("test123");

	await page.route("**/feedback", (route) => {
		route.fulfill({
			status: 200,
			body: JSON.stringify({
				message: "Feedback sent",
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});
	});

	// Wait for the user_report feedback
	const feedbackPromise = page.waitForRequest((request) => {
		return /.*\/feedback$/.test(request.url());
	});

	await page.getByRole("button", { name: "Send" }).click();
	const request = await feedbackPromise;

	const postData = request.postData();
	expect(postData).toBeTruthy();

	const feedback = JSON.parse(postData as string);
	expect(feedback.name).toBe("test");
	expect(feedback.email).toBe("test@ing");
	expect(feedback.message).toBe("test123");
});
