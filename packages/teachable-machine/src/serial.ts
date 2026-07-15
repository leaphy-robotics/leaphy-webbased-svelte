import { parseTrainerLine, TRAINER_PROTOCOL_VERSION, type TrainerMessage } from './protocol';

interface SerialReader { read(): Promise<{ value?: Uint8Array; done: boolean }>; cancel(): Promise<void>; releaseLock(): void }
interface SerialWriter { write(value: Uint8Array): Promise<void>; releaseLock(): void }
export interface SerialPortLike {
	readable: { getReader(): SerialReader } | null;
	writable: { getWriter(): SerialWriter } | null;
	open(options: { baudRate: number }): Promise<void>;
	close(): Promise<void>;
}

export interface NanoSample { embedding: Float32Array; logMel: Float32Array }
export interface RecordEvents {
	onCountdown?: (seconds: number) => void;
	onRecordingStart?: (seconds: number) => void;
	onCaptured?: (count: number) => void;
	onSample?: (sample: NanoSample, index: number, total: number) => void;
}

/** UI-independent Web Serial client for the TeachableAudio training example. */
export class NanoTrainerClient {
	private reader: SerialReader | null = null;
	private readPromise: Promise<void> | null = null;
	private listeners = new Set<(message: TrainerMessage) => void>();
	private compatiblePromise: Promise<void> | null = null;
	private resolveCompatible: (() => void) | null = null;
	private rejectCompatible: ((error: Error) => void) | null = null;

	constructor(private port: SerialPortLike) {}

	static async requestPort(): Promise<NanoTrainerClient> {
		const serial = (navigator as Navigator & { serial?: { requestPort(): Promise<SerialPortLike> } }).serial;
		if (!serial) throw new Error('Web Serial requires desktop Chrome/Edge on HTTPS or localhost');
		return new NanoTrainerClient(await serial.requestPort());
	}

	async connect(timeoutMs = 6000): Promise<void> {
		await this.port.open({ baudRate: 115200 });
		this.compatiblePromise = new Promise<void>((resolve, reject) => {
			this.resolveCompatible = resolve;
			this.rejectCompatible = reject;
		});
		this.readPromise = this.readLoop();
		window.setTimeout(() => void this.write('PING'), 1200);
		const timeout = new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('Nano trainer handshake timed out')), timeoutMs));
		await Promise.race([this.compatiblePromise, timeout]);
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

	async record(count: number, events: RecordEvents = {}): Promise<NanoSample[]> {
		count = Math.max(1, Math.min(12, Math.round(count)));
		return new Promise<NanoSample[]>((resolve, reject) => {
			const spectra = new Map<number, Float32Array>();
			const samples: NanoSample[] = [];
			let countdownTimer: ReturnType<typeof setInterval> | undefined;
			const unsubscribe = this.onMessage((message) => {
				if (message.type === 'preparing') {
					let remaining = Math.ceil(message.delayMs / 1000);
					events.onCountdown?.(remaining);
					countdownTimer = setInterval(() => {
						remaining--;
						if (remaining > 0) events.onCountdown?.(remaining);
						else if (countdownTimer) clearInterval(countdownTimer);
					}, 1000);
				} else if (message.type === 'recordingBatch') {
					if (countdownTimer) clearInterval(countdownTimer);
					events.onRecordingStart?.(message.total);
				} else if (message.type === 'captured') {
					events.onCaptured?.(message.total);
				} else if (message.type === 'spectrogram') {
					spectra.set(message.sample, message.logMel);
				} else if (message.type === 'feature') {
					const logMel = spectra.get(message.sample);
					if (!logMel) { unsubscribe(); reject(new Error(`missing spectrogram ${message.sample}`)); return; }
					const sample = { embedding: message.embedding, logMel };
					samples[message.sample - 1] = sample;
					events.onSample?.(sample, message.sample - 1, message.total);
				} else if (message.type === 'done') {
					unsubscribe();
					resolve(samples);
				} else if (message.type === 'error') {
					unsubscribe();
					reject(new Error(message.message));
				}
			});
			void this.write(`RECORD ${count}`).catch((error) => { unsubscribe(); reject(error); });
		});
	}

	async startLive(onEmbedding: (embedding: Float32Array) => void): Promise<() => Promise<void>> {
		const unsubscribe = this.onMessage((message) => {
			if (message.type === 'liveFeature') onEmbedding(message.embedding);
		});
		await this.write('LIVE_START');
		return async () => { await this.write('LIVE_STOP'); unsubscribe(); };
	}

	private async write(line: string): Promise<void> {
		if (!this.port.writable) throw new Error('serial port is not writable');
		const writer = this.port.writable.getWriter();
		try { await writer.write(new TextEncoder().encode(`${line}\n`)); }
		finally { writer.releaseLock(); }
	}

	private async readLoop(): Promise<void> {
		if (!this.port.readable) throw new Error('serial port is not readable');
		this.reader = this.port.readable.getReader();
		const decoder = new TextDecoder();
		let pending = '';
		try {
			while (true) {
				const { value, done } = await this.reader.read();
				if (done) break;
				pending += decoder.decode(value, { stream: true });
				const lines = pending.split(/\r?\n/);
				pending = lines.pop() ?? '';
				for (const line of lines) {
					if (!line.trim()) continue;
					const message = parseTrainerLine(line);
					if (message.type === 'hello') {
						if (message.version === TRAINER_PROTOCOL_VERSION) this.resolveCompatible?.();
						else this.rejectCompatible?.(new Error(`expected trainer protocol ${TRAINER_PROTOCOL_VERSION}, got ${message.version}`));
					}
					for (const listener of this.listeners) listener(message);
				}
			}
		} finally {
			this.reader.releaseLock();
			this.reader = null;
		}
	}
}
