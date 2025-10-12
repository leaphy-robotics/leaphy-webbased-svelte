import { type RobotDevice, robots } from "$domain/robots";
import { RobotType } from "$domain/robots.types";
import SerialState, { type Prompt } from "$state/serial.svelte";
import WorkspaceState from "$state/workspace.svelte";

async function decompressGzip(gzippedData: Uint8Array) {
	// Create a decompression stream for gzip
	const ds = new DecompressionStream("gzip");

	// Create a readable stream from the Uint8Array
	const blob = new Blob([gzippedData]);
	const stream = blob.stream();

	// Pipe through the decompression stream
	const decompressedStream = stream.pipeThrough(ds);

	// Read the decompressed data
	const blob2 = await new Response(decompressedStream).blob();

	// Convert to string
	return await blob2.text();
}

interface Data {
	robot: RobotDevice;
	program: object;
}

class RobotRestoreState {
	program = $state<Promise<Data | undefined> | null>(null);

	private sendProgramRequest(writer: WritableStreamDefaultWriter<Uint8Array>) {
		const abortController = new AbortController();

		if (SerialState.board?.id?.includes("esp32")) {
			// ESP32 runs on an event, so it doesn't rely on sending the message quickly after a reset
			writer.write(new Uint8Array([0xff])).then();
		} else {
			async function sendProgramRequest() {
				while (!abortController.signal.aborted) {
					await writer.write(new Uint8Array([0xff]));
					await new Promise((resolve) => setTimeout(resolve, 5));
				}
			}
			sendProgramRequest().then();
		}

		return abortController;
	}

	private async receiveProgram(
		reader: ReadableStreamDefaultReader<Uint8Array>,
		requestAbortController: AbortController,
	) {
		let header = "";
		while (true) {
			const { value } = await reader.read();
			const content = new TextDecoder().decode(value);
			header += content;

			const result = /leaphy_program \[(.*)] \(([0-9]*)\)\r\n/.exec(header);
			if (result) {
				requestAbortController.abort();
				const buffer = new Uint8Array(Number.parseInt(result[2]));
				let pos = 0;

				while (pos < Number.parseInt(result[2])) {
					const { value } = await reader.read();
					buffer.set(
						value.slice(0, Math.min(value.length, buffer.length - pos)),
						pos,
					);
					pos += value.length;
				}

				return {
					robot: robots[result[1]],
					program: JSON.parse(await decompressGzip(buffer)),
				} as Data;
			}
		}
	}

	private async checkProgram() {
		if (!SerialState.port) return;

		await SerialState.reserve();

		const port = SerialState.port;
		const reader = port.readable.getReader();
		const writer = port.writable.getWriter();

		await port.setSignals({ dataTerminalReady: false });
		await new Promise(resolve => setTimeout(resolve, 250));
		await port.setSignals({ dataTerminalReady: true });

		const requestAbortController = this.sendProgramRequest(writer);
		const program = await Promise.race([
			this.receiveProgram(reader, requestAbortController),
			new Promise<undefined>((resolve) => setTimeout(resolve, 6000)),
		]);
		requestAbortController.abort();

		reader.releaseLock();
		writer.releaseLock();
		SerialState.release();

		return program;
	}

	async getProgram(prompt: Prompt) {
		if (this.program) {
			return this.program;
		}

		await SerialState.connect(prompt);
		this.program = this.checkProgram();
		return this.program;
	}
}

export default new RobotRestoreState();
