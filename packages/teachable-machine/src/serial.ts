import {
	parseTrainerLine,
	TRAINER_PROTOCOL_VERSION,
	type TrainerMessage,
} from "./protocol";

interface SerialReader {
	read(): Promise<{ value?: Uint8Array; done: boolean }>;
	cancel(): Promise<void>;
	releaseLock(): void;
}

interface SerialWriter {
	write(value: Uint8Array): Promise<void>;
	releaseLock(): void;
}

export interface SerialPortLike {
	readable: { getReader(): SerialReader } | null;
	writable: { getWriter(): SerialWriter } | null;
	open(options: { baudRate: number }): Promise<void>;
	close(): Promise<void>;
}

export interface NanoSample {
	embedding: Float32Array;
	logMel: Float32Array;
}

export interface RecordEvents {
	onCountdown?: (seconds: number) => void;
	onRecordingStart?: (seconds: number) => void;
	onCaptured?: (count: number) => void;
	onSample?: (sample: NanoSample, index: number, total: number) => void;
}

export class NanoTrainerClient {
	private reader: SerialReader | null = null;
	private readPromise: Promise<void> | null = null;
	private listeners = new Set<(message: TrainerMessage) => void>();
	private compatiblePromise: Promise<void> | null = null;
	private resolveCompatible: (() => void) | null = null;
	private rejectCompatible: ((error: Error) => void) | null = null;

	constructor(private port: SerialPortLike) {}

	async connect(timeoutMs = 6000): Promise<void> {
		await this.port.open({ baudRate: 115200 });
		this.compatiblePromise = new Promise<void>((resolve, reject) => {
			this.resolveCompatible = resolve;
			this.rejectCompatible = reject;
		});
		this.readPromise = this.readLoop();
		window.setTimeout(() => void this.write("PING"), 1200);
		let timer: ReturnType<typeof setTimeout> | undefined;
		const timeout = new Promise<never>((_, reject) => {
			timer = setTimeout(
				() => reject(new Error("Nano trainer handshake timed out")),
				timeoutMs,
			);
		});
		try {
			await Promise.race([this.compatiblePromise, timeout]);
		} finally {
			clearTimeout(timer);
		}
	}

	async disconnect(): Promise<void> {
		await this.reader?.cancel().catch(() => undefined);
		await this.readPromise?.catch(() => undefined);
		await this.port.close();
	}

	onMessage(listener: (message: TrainerMessage) => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	async record(
		count: number,
		events: RecordEvents = {},
	): Promise<NanoSample[]> {
		count = Math.max(1, Math.min(12, Math.round(count)));
		return new Promise<NanoSample[]>((resolve, reject) => {
			const spectra = new Map<number, Float32Array>();
			const samples: NanoSample[] = [];
			let countdownTimer: ReturnType<typeof setInterval> | undefined;
			let unsubscribe = () => {};
			const stopCountdown = () => {
				clearInterval(countdownTimer);
				countdownTimer = undefined;
			};
			const fail = (error: unknown) => {
				stopCountdown();
				unsubscribe();
				reject(error);
			};

			unsubscribe = this.onMessage((message) => {
				switch (message.type) {
					case "preparing": {
						stopCountdown();
						let remaining = Math.ceil(message.delayMs / 1000);
						events.onCountdown?.(remaining);
						countdownTimer = setInterval(() => {
							remaining--;
							if (remaining > 0) events.onCountdown?.(remaining);
							else stopCountdown();
						}, 1000);
						return;
					}
					case "recordingBatch":
						stopCountdown();
						events.onRecordingStart?.(message.total);
						return;
					case "captured":
						events.onCaptured?.(message.total);
						return;
					case "spectrogram":
						spectra.set(message.sample, message.logMel);
						return;
					case "feature": {
						const logMel = spectra.get(message.sample);
						if (!logMel) {
							fail(new Error(`missing spectrogram ${message.sample}`));
							return;
						}
						const sample = { embedding: message.embedding, logMel };
						samples[message.sample - 1] = sample;
						events.onSample?.(sample, message.sample - 1, message.total);
						return;
					}
					case "done":
						stopCountdown();
						unsubscribe();
						resolve(samples);
						return;
					case "error":
						fail(new Error(message.message));
				}
			});
			void this.write(`RECORD ${count}`).catch(fail);
		});
	}

	async startLive(
		onEmbedding: (embedding: Float32Array) => void,
	): Promise<() => Promise<void>> {
		const unsubscribe = this.onMessage((message) => {
			if (message.type === "liveFeature") onEmbedding(message.embedding);
		});
		await this.write("LIVE_START");
		return async () => {
			await this.write("LIVE_STOP");
			unsubscribe();
		};
	}

	private async write(line: string): Promise<void> {
		if (!this.port.writable) throw new Error("serial port is not writable");
		const writer = this.port.writable.getWriter();
		try {
			await writer.write(new TextEncoder().encode(`${line}\n`));
		} finally {
			writer.releaseLock();
		}
	}

	private async readLoop(): Promise<void> {
		if (!this.port.readable) throw new Error("serial port is not readable");
		this.reader = this.port.readable.getReader();
		const decoder = new TextDecoder();
		let pending = "";
		try {
			while (true) {
				const { value, done } = await this.reader.read();
				if (done) break;
				pending += decoder.decode(value, { stream: true });
				const lines = pending.split(/\r?\n/);
				pending = lines.pop() ?? "";
				for (const line of lines) {
					if (!line.trim()) continue;
					const message = parseTrainerLine(line);
					this.handleMessage(message);
				}
			}
		} finally {
			this.reader.releaseLock();
			this.reader = null;
		}
	}

	private handleMessage(message: TrainerMessage): void {
		if (message.type === "hello") {
			if (message.version === TRAINER_PROTOCOL_VERSION) {
				this.resolveCompatible?.();
			} else {
				this.rejectCompatible?.(
					new Error(
						`expected trainer protocol ${TRAINER_PROTOCOL_VERSION}, got ${message.version}`,
					),
				);
			}
		}
		for (const listener of this.listeners) listener(message);
	}
}
