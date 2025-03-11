import { expect, test } from "@playwright/test";
import { goToHomePage, selectRobot } from "./utils";

test.beforeEach(goToHomePage);

test("User Feedback", async ({ page }) => {
	await selectRobot(page, "Leaphy Starling", "Nano");

	await page.getByRole("button", { name: "Tips" }).click();
	await page.getByRole("cell", { name: "Suggestion / Feedback" }).click();
	await page.getByPlaceholder("Your name...").fill("test");
	await page.getByPlaceholder("Email").fill("test@ing");
	await page.locator("textarea").fill("test123");

	// Wait for the user_report feedback
	const feedbackPromise = page.waitForRequest((request) => {
		if (!/.*\/api\/2\/envelope\/.*/.test(request.url())) {
			return false;
		}

		let messages = request
			.postData()
			?.split("\n")
			.map((line) => JSON.parse(line));

		return messages !== undefined && messages[1].type === "user_report";
	});

	await page.getByRole("button", { name: "Send" }).click();
	let request = await feedbackPromise;

	let postData = request.postData();
	expect(postData).toBeTruthy();

	let messages = (postData as string)
		.split("\n")
		.map((line) => JSON.parse(line));

	let feedback = messages[2];
	expect(feedback.name).toBe("test");
	expect(feedback.email).toBe("test@ing");
	expect(feedback.comments).toBe("test123");
});
