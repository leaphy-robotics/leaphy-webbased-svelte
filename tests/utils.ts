import { PlaywrightTestArgs } from "@playwright/test";

export async function goToHomePage({ page }: PlaywrightTestArgs) {
    await page.goto("/");
    await page.getByRole("button", { name: "English" }).click();
    await page.getByRole("button", { name: "Let's get started!" }).click();
}
