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

test("cancelling the serial port chooser", async ({ page }) => {
	await selectRobot(page, "Leaphy Original");
	await page.evaluate(() => {
		navigator.serial.requestPort = async () => {
			throw new DOMException("No port selected by the user.", "NotFoundError");
		};
	});
	await page.getByRole("button", { name: "Connect", exact: true }).click();

	await expect
		.poll(() =>
			page.evaluate(async (path) => {
				const { default: serial } = await import(path);
				return serial.status;
			}, SERIAL),
		)
		.toBe("disconnected");
});

test("a serial port that fails to open shows a popup", async ({ page }) => {
	await selectRobot(page, "Leaphy Original");
	const connected = await page.evaluate(async (path) => {
		const { default: serial, Prompt } = await import(path);
		serial.requestPort = async () => ({
			readable: null,
			writable: null,
			getInfo: () => ({}),
			open: async () => {
				throw new DOMException("Failed to open serial port.", "NetworkError");
			},
		});
		return serial.connectWithFeedback(Prompt.MAYBE);
	}, SERIAL);

	expect(connected).toBe(false);
	await expect(page.getByText("Unable to connect to robot")).toBeVisible();
});

test("cancelling the file picker", async ({ page }) => {
	await selectRobot(page, "Leaphy Original");
	await page.evaluate(() => {
		window.showOpenFilePicker = async () => {
			throw new DOMException("The user aborted a request.", "AbortError");
		};
	});
	await openProjectFile(page);
});

test("opening a file when the browser has no file picker API", async ({
	page,
}) => {
	await selectRobot(page, "Leaphy Original");
	await page.evaluate(() => {
		delete (window as Partial<Window>).showOpenFilePicker;
	});

	const chooser = page.waitForEvent("filechooser");
	await openProjectFile(page);
	await chooser;
});

async function connectBluetooth(page: Page, failure: [string, string]) {
	return page.evaluate(
		async ({ path, failure: [message, name] }) => {
			const error = new DOMException(message, name);
			Object.defineProperty(navigator, "bluetooth", {
				configurable: true,
				value: { requestDevice: async () => Promise.reject(error) },
			});

			const { default: bluetooth } = await import(path);
			await bluetooth.connect();
		},
		{ path: BLUETOOTH, failure },
	);
}

test("cancelling the Bluetooth chooser", async ({ page }) => {
	await selectRobot(page, "Leaphy Original");
	await connectBluetooth(page, [
		"User cancelled the requestDevice() chooser.",
		"NotFoundError",
	]);
	await expect(page.getByText("Unable to connect over Bluetooth")).toBeHidden();
});

test("a Bluetooth adapter problem shows a popup", async ({ page }) => {
	await selectRobot(page, "Leaphy Original");
	await connectBluetooth(page, [
		"Bluetooth adapter not available.",
		"NotFoundError",
	]);
	await expect(
		page.getByText("Unable to connect over Bluetooth"),
	).toBeVisible();
});

test("a failed Bluetooth connection shows a popup", async ({ page }) => {
	await selectRobot(page, "Leaphy Original");
	await page.evaluate(async (path) => {
		const device = {
			addEventListener() {},
			gatt: {
				connect: async () => {
					throw new DOMException("Connection attempt failed.", "NetworkError");
				},
			},
		};
		Object.defineProperty(navigator, "bluetooth", {
			configurable: true,
			value: { requestDevice: async () => device },
		});

		const { default: bluetooth } = await import(path);
		await bluetooth.connect();
	}, BLUETOOTH);

	await expect(
		page.getByText("Unable to connect over Bluetooth"),
	).toBeVisible();
});

test("Bluetooth reconnecting stops after a few attempts", async ({ page }) => {
	await selectRobot(page, "Leaphy Original");
	const attempts = await page.evaluate(async (path) => {
		let attempts = 0;
		const { default: bluetooth } = await import(path);
		// A class instance, because $state would wrap a plain object in a proxy
		class FakeDevice {
			gatt = {
				connect: async () => {
					attempts++;
					throw new DOMException("Connection attempt failed.", "NetworkError");
				},
			};
		}
		const device = new FakeDevice();
		bluetooth.device = device;
		await bluetooth.handleDisconnect(device);
		return attempts;
	}, BLUETOOTH);

	expect(attempts).toBe(3);
});

test("a Bluetooth service without characteristics", async ({ page }) => {
	await page.evaluate(async (path) => {
		const { default: bluetooth } = await import(path);
		bluetooth.controlService = {
			getCharacteristics: async () => {
				throw new DOMException(
					"No Characteristics found in service.",
					"NotFoundError",
				);
			},
		};
	}, BLUETOOTH);
});

test("the program check handles a port that isn't open", async ({ page }) => {
	const program = await page.evaluate(
		async ({ serialPath, restorePath }) => {
			const { default: serial, Prompt } = await import(serialPath);
			const { default: restore } = await import(restorePath);
			let reached = false;
			serial.connect = async () => {};
			serial.initPort = async () => {};
			serial.port = {
				get readable() {
					reached = true;
					return null;
				},
				writable: null,
			};
			restore.program = null;
			const program = (await restore.getProgram(Prompt.NEVER)) ?? "none";
			return { program, reached };
		},
		{ serialPath: SERIAL, restorePath: RESTORE },
	);

	expect(program).toEqual({ program: "none", reached: true });
});

test("the program check handles setSignals failing", async ({ page }) => {
	const result = await page.evaluate(
		async ({ serialPath, restorePath }) => {
			const { default: serial, Prompt } = await import(serialPath);
			const { default: restore } = await import(restorePath);
			let attempted = false;
			serial.connect = async () => {};
			serial.initPort = async () => {};
			serial.port = {
				readable: new ReadableStream(),
				writable: new WritableStream(),
				setSignals: async () => {
					attempted = true;
					throw new DOMException("Failed to set signals.", "NetworkError");
				},
			};
			restore.program = null;
			const program = (await restore.getProgram(Prompt.NEVER)) ?? "none";
			return { program, attempted };
		},
		{ serialPath: SERIAL, restorePath: RESTORE },
	);

	expect(result).toEqual({ program: "none", attempted: true });
});

test("concurrent serial connections wait for the port to open", async ({
	page,
}) => {
	const result = await page.evaluate(async (path) => {
		const { default: serial, Prompt } = await import(path);

		class SlowPort {
			readable: ReadableStream | null = null;
			writable: WritableStream | null = null;
			opens = 0;
			getInfo = () => ({});
			async open() {
				this.opens++;
				await new Promise((resolve) => setTimeout(resolve, 100));
				this.readable = new ReadableStream();
				this.writable = new WritableStream();
			}
		}
		const port = new SlowPort();
		serial.requestPort = async () => port;

		const first = serial.connect(Prompt.MAYBE);
		await serial.connect(Prompt.MAYBE);
		const openAfterSecondCall = !!port.readable;
		await first;

		return { opens: port.opens, openAfterSecondCall, status: serial.status };
	}, SERIAL);

	expect(result).toEqual({
		opens: 1,
		openAfterSecondCall: true,
		status: "ready",
	});
});

for (const [name, content] of [
	["program.txt", "// Definieer pinnen"],
	["archive.zip", "PK\u0003\u0004"],
]) {
	test(`opening ${name} from C++ mode`, async ({ page }) => {
		await selectRobot(page, "Leaphy C++");
		await stubPickerWithFile(page, name, content);
		await openProjectFile(page);

		await expect(page.getByText("Invalid project")).toBeVisible();
		expect(await savedFileCount(page)).toBe(0);
	});
}

test("denying access to a saved file keeps the restore popup open", async ({
	page,
}) => {
	await page.addInitScript(() => {
		FileSystemFileHandle.prototype.requestPermission = async () => "denied";
	});
	await page.evaluate(async () => {
		const root = await navigator.storage.getDirectory();
		const fileHandle = await root.getFileHandle("project.l_original", {
			create: true,
		});
		const { projectDB } = await import("/src/lib/domain/storage.ts");
		await projectDB.saves.add({
			mode: "BLOCKS",
			robot: "l_original",
			date: Date.now(),
			fileHandle,
		});
	});

	await page.reload();
	await page.getByText("project.l_original").click();
	await page.getByRole("button", { name: "Continue" }).click();

	await expect(page.getByText("No access to file")).toBeVisible();
	await expect(
		page.getByRole("heading", { name: "Continue working" }),
	).toBeVisible();
});
