import { expect, type Page } from "@playwright/test";
import {
	goToHomePage,
	openExample,
	selectRobot,
	strictTest as test,
} from "./utils";

test.beforeEach(goToHomePage);

const SERIAL = "/src/lib/state/serial.svelte.ts";
const BLOCKLY = "/src/lib/state/blockly.svelte.ts";
const BLUETOOTH = "/src/lib/state/bluetooth.svelte.ts";
const RESTORE = "/src/lib/state/robotRestore.svelte.ts";

async function openProjectFile(page: Page) {
	await page.getByRole("button", { name: "My projects" }).click();
	await page.getByText("Open", { exact: true }).click();
}

// A real file handle from the origin private file system, which can be stored in IndexedDB
async function stubPickerWithFile(page: Page, name: string, content: string) {
	await page.evaluate(
		async ([name, content]) => {
			const root = await navigator.storage.getDirectory();
			const handle = await root.getFileHandle(name, { create: true });
			const writable = await handle.createWritable();
			await writable.write(content);
			await writable.close();
			window.showOpenFilePicker = async () => [handle] as never;
		},
		[name, content],
	);
}

async function savedFileCount(page: Page) {
	return page.evaluate(async () => {
		const { projectDB } = await import("/src/lib/domain/storage.ts");
		return projectDB.saves.count();
	});
}

test("closing the tab on the start screen", async ({ page }) => {
	await page.evaluate(() => window.dispatchEvent(new Event("beforeunload")));
});

test("new project in C++ mode", async ({ page }) => {
	await selectRobot(page, "Leaphy C++");
	await page.getByRole("button", { name: "My projects" }).click();
	await page.getByText("New", { exact: true }).click();
});

test("switching from C++ to blocks without saved blocks", async ({ page }) => {
	await selectRobot(page, "Leaphy C++");
	await page.getByRole("button", { name: "Blocks", exact: true }).click();

	await page.getByRole("button", { name: "Ok", exact: true }).click();

	await expect(page.locator(".injectionDiv")).toBeVisible();
});

test("losing the serial connection resets the connection state", async ({
	page,
}) => {
	const state = await page.evaluate(async (path) => {
		const { default: serial } = await import(path);
		serial.port = { readable: {}, writable: {}, close: async () => {} };
		serial.status = "ready";
		serial.reader = {
			read: async () => {
				throw new DOMException("The device has been lost.", "NetworkError");
			},
			releaseLock() {},
		};
		await serial.runReadLoop();
		return { status: serial.status, hasPort: !!serial.port };
	}, SERIAL);

	expect(state).toEqual({ status: "disconnected", hasPort: false });
});
