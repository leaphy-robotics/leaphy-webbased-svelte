import type { Programmer } from "$domain/robots.types";
import type { LeaphyPort } from "$state/serial.svelte";
import WorkspaceState from "$state/workspace.svelte";
import hex from "intel-hex";
import { clearReadBuffer, delay } from "../utils";
import constants from "./constants";
import Parser, { concat } from "./parser";

const defaultOptions = {
	timeout: 0xc8,
	stabDelay: 0x64,
	cmdexeDelay: 0x19,
	synchLoops: 0x20,
	byteDelay: 0x00,
	pollValue: 0x53,
	pollIndex: 0x03,
};

export default class STK500v2 implements Programmer {
	parser: Parser;
	port: LeaphyPort;
	writeStream: WritableStreamDefaultWriter<Uint8Array>;
	readStream: ReadableStreamDefaultReader<Uint8Array>;

	async upload(port: LeaphyPort, response: Record<string, string>) {
		this.port = port;
		await this.port.close();
		await this.port.open({ baudRate: 115200 });

		this.writeStream = port.writable.getWriter();
		this.readStream = port.readable.getReader();

		const program = response.hex;

		this.parser = new Parser(this.writeStream, this.readStream);
		this.parser.addEventListener("log", (event) => {
			WorkspaceState.uploadLog.push(
				"detail" in event ? (event.detail as string) : `type_${event.type}`,
			);
		});

		return new Promise<void>((resolve, reject) => {
			this.sync(5, (err) => {
				if (err) {
					return reject("NOT_IN_SYNC");
				}

				this.verifySignature(new Uint8Array([30, 152, 1]), (err) => {
					if (err) {
						return reject("SIGNATURE_MISMATCH");
					}

					this.enterProgrammingMode({}, async (err) => {
						if (err) {
							return reject("OPTIONS_NOT_ACCEPTED");
						}

						await this.flash(hex.parse(program).data, 256);

						this.exitProgrammingMode(async (err) => {
							if (err) reject(err);

							this.writeStream = this.parser.writer;
							this.readStream = this.parser.reader;

							// Reset the Arduino
							try {
								await this.reset(115200);
							} catch {}

							this.readStream.releaseLock();
							this.writeStream.releaseLock();
							await this.port.close();
							await this.port.open({ baudRate: 115200 });

							resolve();
						});
					});
				});
			});
		});
	}

	sync(attempts: number, done: (err: Error | false, res: any) => void) {
		const cmd = new Uint8Array([constants.CMD_SIGN_ON]);
		let tries = 1;

		const attempt = () => {
			tries = tries + 1;

			this.parser
				.send(cmd, (err: false | Error, pkt) => {
					if (err && tries <= attempts) return attempt();

					let res: string;
					let error: false | Error = false;

					// message response format for CMD_SIGN_ON
					// 1 CMD_SIGN_ON
					// 1 STATUS_CMD_OK
					// 1 8 - length of sig string
					// 8 the signature string - "STK500_2" or "AVRISP_2"
					const response = pkt.message;

					if (response[0] !== constants.CMD_SIGN_ON) {
						// something is wrong. look for error in constants.
						error = new Error(
							`command response was not CMD_SIGN_ON. ${response[0]}`,
						);
					} else if (response[1] !== constants.STATUS_CMD_OK) {
						// malformed. check command status constants and return error
						error = new Error(`command status was not ok. ${response[1]}`);
					} else {
						let len = response[2];
						res = `${response.slice(3)}`;
						if (res.length !== len) {
							// something is wrong but all signs point to right,
						}
					}

					done(error, res);
				})
				.then();
		};
		attempt();
	}

	verifySignature(signature: Uint8Array, done: (err?: Error) => void) {
		this.getSignature(
			(_error: Error | false, reportedSignature: Uint8Array) => {
				const equals =
					signature.every((byte, i) => reportedSignature[i] === byte) &&
					signature.length === reportedSignature.length;

				if (!equals) done(new Error("signature does not match"));
				else done();
			},
		).then();
	}

	async getSignature(
		done: (error: Error | false, signature: Uint8Array) => void,
	) {
		let reportedSignature = new Uint8Array(3);
		const view = new DataView(reportedSignature.buffer);

		try {
			await this.getSignatureOffset(view, 0x00);
			await this.getSignatureOffset(view, 0x01);
			await this.getSignatureOffset(view, 0x02);
		} catch (e) {
			done(e, reportedSignature);
		}

		done(false, reportedSignature);
	}

	getSignatureOffset(view: DataView, offset: number) {
		const numTx = 0x04;
		const numRx = 0x04;
		const rxStartAddr = 0x00;

		const cmd = new Uint8Array([
			constants.CMD_SPI_MULTI,
			numTx,
			numRx,
			rxStartAddr,
			0x30,
			0x00,
			offset,
			0x00,
		]);
		return new Promise<void>((resolve, reject) => {
			this.parser
				.send(cmd, (error, pkt) => {
					if (pkt?.message && pkt.message.length >= 6) {
						let sig = pkt.message[5];
						view.setUint8(offset, sig);
					}

					if (error) reject(error);
					else resolve();
				})
				.then();
		});
	}

	enterProgrammingMode(
		setOptions: Partial<typeof defaultOptions>,
		done: (err: Error | false) => void,
	) {
		const options = Object.assign(defaultOptions, setOptions);
		const cmd1 = 0xac;
		const cmd2 = 0x53;
		const cmd3 = 0x00;
		const cmd4 = 0x00;

		const cmd = new Uint8Array([
			constants.CMD_ENTER_PROGMODE_ISP,
			options.timeout,
			options.stabDelay,
			options.cmdexeDelay,
			options.synchLoops,
			options.byteDelay,
			options.pollValue,
			options.pollIndex,
			cmd1,
			cmd2,
			cmd3,
			cmd4,
		]);
		this.parser
			.send(cmd, (err) => {
				done(err);
			})
			.then();
	}

	loadAddress(useaddr: number, done: (err?: Error) => void) {
		const msb = ((useaddr >> 24) & 0xff) | 0x80;
		const xsb = (useaddr >> 16) & 0xff;
		const ysb = (useaddr >> 8) & 0xff;
		const lsb = useaddr & 0xff;

		const cmdBuf = new Uint8Array([
			constants.CMD_LOAD_ADDRESS,
			msb,
			xsb,
			ysb,
			lsb,
		]);
		this.parser
			.send(cmdBuf, (err) => {
				if (err) done(err);
				else done();
			})
			.then();
	}

	loadPage(writeBytes: Uint8Array, done: (err?: Error) => void) {
		const bytesMsb = writeBytes.length >> 8; //Total number of bytes to program, MSB first
		const bytesLsb = writeBytes.length & 0xff; //Total number of bytes to program, MSB first
		const mode = 0xc1; //paged, rdy/bsy polling, write page
		const delay = 0x0a; //Delay, used for different types of programming termination, according to mode byte
		const cmd1 = 0x40; // Load Page, Write Program Memory
		const cmd2 = 0x4c; // Write Program Memory Page
		const cmd3 = 0x20; //Read Program Memory
		const poll1 = 0x00; //Poll Value #1
		const poll2 = 0x00; //Poll Value #2 (not used for flash programming)

		let cmdBuf = new Uint8Array([
			constants.CMD_PROGRAM_FLASH_ISP,
			bytesMsb,
			bytesLsb,
			mode,
			delay,
			cmd1,
			cmd2,
			cmd3,
			poll1,
			poll2,
		]);
		cmdBuf = concat([cmdBuf, writeBytes]);
		this.parser
			.send(cmdBuf, (err) => {
				if (err) done(err);
				else done();
			})
			.then();
	}

	async flash(hex: Uint8Array, pageSize: number) {
		let pageaddr = 0;
		let writeBytes: Uint8Array;
		let useAddr: number;

		while (pageaddr < hex.length) {
			useAddr = pageaddr >> 1;
			await new Promise<void>((resolve, reject) => {
				this.loadAddress(useAddr, (err) => {
					if (err) reject(err);
					else resolve();
				});
			});
			writeBytes = hex.slice(
				pageaddr,
				hex.length > pageSize ? pageaddr + pageSize : hex.length - 1,
			);
			await new Promise<void>((resolve, reject) => {
				this.loadPage(writeBytes, (err) => {
					if (err) reject(err);
					else resolve();
				});
			});
			await new Promise<void>((resolve) => {
				pageaddr = pageaddr + writeBytes.length;
				setTimeout(resolve, 4);
			});
		}
	}

	exitProgrammingMode(done: (err?: Error) => void) {
		const preDelay = 0x01;
		const postDelay = 0x01;

		const cmd = new Uint8Array([
			constants.CMD_LEAVE_PROGMODE_ISP,
			preDelay,
			postDelay,
		]);
		this.parser
			.send(cmd, (err) => {
				if (err) done(err);
				else done();
			})
			.then();
	}

	async reset(baudRate: number) {
		this.writeStream?.releaseLock();
		this.readStream?.releaseLock();
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
