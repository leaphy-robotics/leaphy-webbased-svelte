import type { Buffer } from "buffer";
import type { Programmer } from "$domain/robots.types";
import type { LeaphyPort } from "$state/serial.svelte.js";
import WorkspaceState from "$state/workspace.svelte.js";
import { parse } from "intel-hex";
import {
	clearReadBuffer,
	convertArrayToHex,
	delay,
	includesAll,
} from "../utils";
import { REQUESTS, RESPONSES, SIGNATURE } from "./constants";

interface Options {
	devicecode: number;
	revision: number;
	progtype: number;
	parmode: number;
	polling: number;
	selftimed: number;
	lockbytes: number;
	fusebytes: number;
	flashpollval1: number;
	flashpollval2: number;
	eeprompollval1: number;
	eeprompollval2: number;
	pagesizehigh: number;
	pagesizelow: number;
	eepromsizehigh: number;
	eepromsizelow: number;
	flashsize4: number;
	flashsize3: number;
	flashsize2: number;
	flashsize1: number;
}

export default class STK500v1 implements Programmer {
	port: LeaphyPort;
	readStream: ReadableStreamDefaultReader<Uint8Array>;
	writeStream: WritableStreamDefaultWriter<Uint8Array>;

	async attemptBootloaders() {
		let response: Uint8Array;
		// start timer
		try {
			response = await this.attemptNewBootloader();
			WorkspaceState.uploadLog.push("Using new bootloader");
		} catch {
			response = await this.attemptOldBootloader();
			if (response !== null) {
				WorkspaceState.uploadLog.push("Using old bootloader");
			}
		}

		if (response === null) {
			throw new Error("Could not connect to Arduino");
		}

		return response;
	}

	async upload(port: LeaphyPort, res: Record<string, string>) {
		this.port = port;
		this.readStream = this.port.readable.getReader();
		this.writeStream = this.port.writable.getWriter();

		const response = await this.attemptBootloaders();
		if (!includesAll([RESPONSES.IN_SYNC, RESPONSES.OK], response)) {
			throw new Error("Arduino is not in sync");
		}

		// Try to match signature
		const signature = await this.send([0x75]);
		if (!includesAll(SIGNATURE, signature)) {
			throw new Error("Arduino does not match signature");
		}

		const optionsResponse = await this.writeOptions({
			pagesizehigh: 0,
			pagesizelow: 128,
		});
		if (!includesAll([RESPONSES.OK], optionsResponse)) {
			throw new Error("Arduino did not accept options");
		}

		// Start programming
		await this.send([REQUESTS.ENTER_PROG_MODE]);
		await this.writeProgram(res.hex);
		await this.send([REQUESTS.LEAVE_PROG_MODE]);

		// Reset the Arduino
		try {
			await this.reset(115200);
		} catch (error) {}

		this.readStream.releaseLock();
		this.writeStream.releaseLock();
		await this.port.close();
		await this.port.open({ baudRate: 115200 });
	}

	async attemptOldBootloader(): Promise<Uint8Array> {
		let response = null;
		try {
			await this.reset(57600);
		} catch (error) {
			throw new Error("Could not connect to Arduino: Reset failed");
		}
		for (let i = 0; i < 10; i++) {
			try {
				response = await this.send([REQUESTS.GET_SYNC], 500);
				break;
			} catch (error) {
				WorkspaceState.uploadLog.push(error.toString());
			}
		}
		if (response === null) {
			this.readStream.releaseLock();
			this.writeStream.releaseLock();
			this.readStream = null;
			this.writeStream = null;
			WorkspaceState.uploadLog.push(
				"Could not connect to Arduino (old bootloader)",
			);
			throw new Error("Could not connect to Arduino");
		}
		return response;
	}

	async attemptNewBootloader(): Promise<Uint8Array> {
		let response = null;
		try {
			await this.reset(115200);
		} catch (error) {
			WorkspaceState.uploadLog.push(
				"Could not connect to Arduino: Reset failed (new bootloader)",
			);
			throw new Error("Could not connect to Arduino: Reset failed");
		}
		for (let i = 0; i < 10; i++) {
			try {
				response = await this.send([REQUESTS.GET_SYNC], 500);
				break;
			} catch (error) {
				WorkspaceState.uploadLog.push(error.toString());
			}
		}
		if (response === null) {
			WorkspaceState.uploadLog.push(
				"Could not connect to Arduino (new bootloader)",
			);
			throw new Error("Could not connect to Arduino");
		}
		return response;
	}

	async writeProgram(program: string) {
		const hex = parse(program);

		let data: Buffer = hex.data;
		let i = 0;
		do {
			const offset = Math.min(data.length, 128);
			const page = data.subarray(0, offset);
			data = data.subarray(offset);
			const length = page.length;
			const lengthHigh = length >> 8;
			const lengthLow = length & 0xff;
			const startAddress = (hex.startSegmentAddress + i) >> 1;

			await this.send([
				REQUESTS.SET_ADDRESS,
				startAddress & 0xff,
				(startAddress >> 8) & 0xff,
			]);
			const buffer = new Uint8Array([
				REQUESTS.SET_PAGE,
				lengthHigh,
				lengthLow,
				0x46,
				...page,
			]);
			await this.send(buffer);
			i += page.length;
		} while (data.length > 0);
	}

	async writeOptions(options: Partial<Options>) {
		const buffer = new Uint8Array([
			0x42,
			options.devicecode || 0,
			options.revision || 0,
			options.progtype || 0,
			options.parmode || 0,
			options.polling || 0,
			options.selftimed || 0,
			options.lockbytes || 0,
			options.fusebytes || 0,
			options.flashpollval1 || 0,
			options.flashpollval2 || 0,
			options.eeprompollval1 || 0,
			options.eeprompollval2 || 0,
			options.pagesizehigh || 0,
			options.pagesizelow || 0,
			options.eepromsizehigh || 0,
			options.eepromsizelow || 0,
			options.flashsize4 || 0,
			options.flashsize3 || 0,
			options.flashsize2 || 0,
			options.flashsize1 || 0,
		]);

		return await this.send(buffer);
	}

	async send(command: number[] | Uint8Array, timeoutMs = 1000) {
		const buffer = new Uint8Array([...command, REQUESTS.CRC_EOP]);
		WorkspaceState.uploadLog.push(
			`Sending: ${convertArrayToHex(buffer).join(" ")}`,
		);
		await this.writeStream.write(buffer);

		const timeoutPromise = new Promise((resolve, _) => {
			setTimeout(() => {
				resolve("Timeout");
			}, timeoutMs);
		});

		let IN_SYNC = false;
		let OK = false;
		let returnBuffer = new Uint8Array(0);
		while (true) {
			const promise = this.receive();
			const result = await Promise.race([promise, timeoutPromise]);

			if (result instanceof Uint8Array) {
				const answer = Array.from(result);
				if (answer.includes(RESPONSES.NOT_IN_SYNC)) {
					WorkspaceState.uploadLog.push("Arduino is not in sync");
					throw new Error("Arduino is not in sync");
				}
				returnBuffer = new Uint8Array([...returnBuffer, ...answer]);
				if (answer.includes(RESPONSES.IN_SYNC)) IN_SYNC = true;
				if (answer.includes(RESPONSES.OK)) OK = true;
				if (OK && IN_SYNC) return returnBuffer;
			} else if (result === "Timeout") {
				await this.readStream.cancel();
				this.readStream.releaseLock();
				this.readStream = this.port.readable.getReader();
				throw new Error("Timeout");
			}
		}
	}

	async receive() {
		const ev = await this.readStream.read();
		WorkspaceState.uploadLog.push(
			`Received: ${convertArrayToHex(ev.value).join(" ")}`,
		);
		return ev.value;
	}

	async reset(baudRate: number) {
		this.writeStream.releaseLock();
		this.readStream.releaseLock();
		await this.port.close();
		await this.port.open({ baudRate: baudRate });
		this.readStream = this.port.readable.getReader();
		this.writeStream = this.port.writable.getWriter();
		await this.port.setSignals({ dataTerminalReady: false });
		await delay(250);
		await this.port.setSignals({ dataTerminalReady: true });
		await clearReadBuffer(this.readStream);
	}
}
