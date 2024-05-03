import type { Programmer } from "$domain/robots.types";
import { uploadLog, type LeaphyPort } from "$state/workspace.svelte";
import Module from "@leaphy-robotics/avrdude-webassembly/avrdude.js";

declare global {
	interface Window {
		avrdudeLog: string[];
		writeStream: WritableStreamDefaultWriter<Uint8Array>;
		activePort: LeaphyPort;
		funcs: any;
	}
}

const controllerArgs: Record<string, string> = {
	atmega328p:
		"avrdude -P /dev/null -V -v -p atmega328p -c stk500v1 -C /tmp/avrdude.conf -b 115200 -D -U flash:w:/tmp/program.hex:i",
	atmega2560:
		"avrdude -P /dev/null -V -v -p atmega2560 -c stk500v2 -C /tmp/avrdude.conf -b 115200 -D -U flash:w:/tmp/program.hex:i",
};

export default class AvrDude implements Programmer {
	private args: string;

	constructor(controller: string) {
		this.args = controllerArgs[controller];
	}

	async upload(
		port: LeaphyPort,
		response: Record<string, string>,
	): Promise<void> {
		const avrdude = await Module({
			locateFile: (path: string) => {
				return `/${path}`;
			},
		});
		window.funcs = avrdude;

		if (port.readable || port.writable) await port.close();
		await port.open({ baudRate: 115200 });
		window.activePort = port;

		const avrdudeConfig = await fetch("/avrdude.conf").then((res) =>
			res.text(),
		);
		avrdude.FS.writeFile("/tmp/avrdude.conf", avrdudeConfig);
		avrdude.FS.writeFile("/tmp/program.hex", response.hex);

		const disconnectPromise = new Promise((resolve) => {
			if (navigator.serial && port instanceof SerialPort)
				port.addEventListener("disconnect", resolve)
		});
		const oldConsoleError = console.error;
		const workerErrorPromise = new Promise((resolve) => {
			console.error = (...data) => {
				if (data[1].name === "ExitStatus") {
					resolve({ type: "worker-error" });
				} else {
					oldConsoleError(...data);
					resolve({ type: "error" });
				}
			};
		});
		const startAvrdude = avrdude.cwrap("startAvrdude", "number", ["string"]);

		let race = await Promise.race([
			disconnectPromise,
			startAvrdude(this.args),
			workerErrorPromise,
		]);

		console.error = oldConsoleError;
		if (race.type) {
			if (race.type === "worker-error") {
				race = -3;
			} else {
				race = -2;
			}
		}

		if (window.writeStream) window.writeStream.releaseLock();

		const log = window.avrdudeLog;
		uploadLog.set(log);

		if (race !== 0) {
			if (race === -2) {
				throw new Error("Port disconnected");
			}
			if (race === -3) {
				throw new Error("Worker error");
			}
			throw new Error("Avrdude failed");
		}
		await port.open({ baudRate: 115200 });
	}
}
