import type { Page, PlaywrightTestArgs } from "@playwright/test";

export async function goToHomePage({ page }: PlaywrightTestArgs) {
	await page.goto("/");
	await page.getByRole("button", { name: "English" }).click();
	await page.getByRole("button", { name: "Let's get started!" }).click();
}

export async function openExample(page: Page, example: string | RegExp) {
	await page.getByRole("button", { name: "My projects" }).click();
	await page.getByRole("cell", { name: "Examples" }).click();
	await page.getByRole("button", { name: example }).click();
}
