import { promises as fs } from "node:fs";
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

// Playwright doesn't seem to support `showOpenFilePicker()` so this functions mocks it
export async function setNextOpenedFile(
	page: Page,
	path: string,
): Promise<(timeout?: number) => Promise<string>> {
	let content = await fs.readFile(path, "utf-8");

	let onWriteResolve: ((data: string) => void) | undefined = undefined;

	await page.exposeFunction("onWriteOpenedFile", (data: string) => {
		if (onWriteResolve !== undefined) {
			onWriteResolve(data);
		}
	});

	await page.evaluate(
		([content, file_name]) => {
			window.showOpenFilePicker = async (): Promise<[FileSystemFileHandle]> => {
				// return something close enough to what a [FileSystemFileHandle] looks like, as you can't actually create it, atleast i could not find it
				return [
					{
						getFile: async () => {
							return {
								text: async () => content,
								name: file_name,
							};
						},
						createWritable: async () => {
							let written = "";

							return {
								write: async (data: FileSystemWriteChunkType) => {
									// There has to be a better way right??
									if (typeof data === "string") {
										throw "todo";
									}
									if ("data" in data && typeof data.data === "string") {
										written += data.data;
									} else {
										throw "todo";
									}
								},
								close: async () => {
									await (window as any).onWriteOpenedFile(written);
								},
							};
						},
						name: file_name,
					},
				] as unknown as [FileSystemFileHandle];
			};
		},
		[content, path],
	);

	return (timeout = 1000) => {
		return new Promise<string>((resolve, reject) => {
			onWriteResolve = resolve;
			setTimeout(() => {
				reject("File not written within time!");
			}, timeout);
		});
	};
}
