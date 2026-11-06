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
