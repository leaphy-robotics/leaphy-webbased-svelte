import { promises as fs } from "node:fs";
import setupPlaywrightArduino from "@leaphy-robotics/playwright-arduino";
import type { Page, PlaywrightTestArgs } from "@playwright/test";

export async function setupArduino({ page }: PlaywrightTestArgs) {
	await setupPlaywrightArduino(page);
}

export async function goToHomePage({ page }: PlaywrightTestArgs) {
	await page.goto("/");
	await page.getByRole("button", { name: "English" }).click();
	await page.getByRole("button", { name: "Let's get started!" }).click();
}

export async function openExample(page: Page, example: string | RegExp) {
	await page.getByRole("button", { name: "My projects" }).click();
	await page.getByRole("cell", { name: "Examples" }).click();
	await page.getByRole("button", { name: example, exact: true }).click();
}

// Playwright doesn't seem to support `showOpenFilePicker()` so this functions mocks it
export async function mockShowOpenFilePicker(
	page: Page,
	path: string,
): Promise<Promise<(timeout?: number) => Promise<FileSystemWriteChunkType[]>>> {
	let content = await fs.readFile(path, "utf-8");

	await page.evaluate(
		([content, path]) => {
			const blob = new Blob([content], { type: "application/json" });
			const file = new File([blob], path, { type: "application/json" });

			const createWritable = async () => {
				let writtenChunks: FileSystemWriteChunkType[] = [];
				return {
					write: async (data: FileSystemWriteChunkType) => {
						writtenChunks.push(data);
					},
					close: async () => {
						await (window as any).onWriteOpenedFile(writtenChunks);
					},
				};
			};

			const fileHandle = {
				getFile: async () => file,
				name: path,
				createWritable,
			};

			(window as any).showOpenFilePicker = async () => {
				return [fileHandle];
			};
		},
		[content, path],
	);

	let createOnWritePromise = async (timeout = 1000) => {
		let onWriteResolve:
			| ((writtenChunks: FileSystemWriteChunkType[]) => void)
			| undefined = undefined;

		await page.exposeFunction(
			"onWriteOpenedFile",
			(writtenChunks: FileSystemWriteChunkType[]) => {
				if (onWriteResolve) onWriteResolve(writtenChunks);
			},
		);

		return new Promise<FileSystemWriteChunkType[]>((resolve, reject) => {
			onWriteResolve = resolve;
			setTimeout(() => {
				reject("File not written within time!");
			}, timeout);
		});
	};

	return createOnWritePromise;
}
