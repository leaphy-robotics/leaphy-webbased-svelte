import { arduino } from "@leaphy-robotics/leaphy-blocks";
import {
	generateModelHeader,
	headInfer,
	type TrainedHead,
	type TrainingSample,
	trainAudioModel,
} from "@leaphy-robotics/teachable-machine";
import {
	type NanoSample,
	NanoTrainerClient,
	type SerialPortLike,
} from "@leaphy-robotics/teachable-machine/serial";
import base64 from "base64-js";
import type { ISerializer } from "blockly/core/interfaces/i_serializer";
import { get } from "svelte/store";
import { _ } from "svelte-i18n";
import Uploader from "$components/core/popups/popups/uploaders/Uploader.svelte";
import { robots } from "$domain/robots";
import PopupState from "$state/popup.svelte";
import SerialState, { Prompt } from "$state/serial.svelte";
import trainerFirmwareUrl from "../../assets/firmware/TeachableTrainingRecorder.bin?url";

const EMBEDDING_SIZE = 120;
const SPECTROGRAM_SIZE = 49 * 40;
const MIN_CLASS_SAMPLES = 8;
const MIN_BACKGROUND_SAMPLES = 20;

function translate(
	key: string,
	values: Record<string, string | number> = {},
): string {
	return get(_)(key, { values });
}

export interface TeachableSample {
	id: string;
	embedding: Float32Array;
	logMel: Float32Array;
}

export interface TeachableClass {
	id: string;
	name: string;
	isBackground: boolean;
	samples: TeachableSample[];
}

export interface TeachableTrainingSettings {
	epochs: number;
	learningRate: number;
	l2: number;
	batchSize: number;
	variationsPerSample: number;
	noiseLayering: boolean;
}

export interface LossPoint {
	epoch: number;
	loss: number;
	accuracy: number;
}

type DeviceStatus =
	| "disconnected"
	| "connecting"
	| "probing"
	| "flashing"
	| "reconnecting"
	| "ready";

interface SerializedSample {
	id: string;
	embedding: string;
	logMel: string;
}

interface SerializedClass {
	id: string;
	name: string;
	isBackground: boolean;
	samples: SerializedSample[];
}

interface SerializedModel {
	weights: string;
	bias: string;
	finalAccuracy: number;
	realSamples: number;
	generatedSamples: number;
}

interface SerializedState {
	version: 1;
	classes: SerializedClass[];
	settings: TeachableTrainingSettings;
	model: SerializedModel | null;
}

function id(prefix: string): string {
	return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function createClass(name: string, isBackground = false): TeachableClass {
	return { id: id("class"), name, isBackground, samples: [] };
}

function defaultClasses(): TeachableClass[] {
	return [createClass("Class 1"), createClass("Background noise", true)];
}

function encodeFloats(values: Float32Array): string {
	return base64.fromByteArray(
		new Uint8Array(values.buffer, values.byteOffset, values.byteLength),
	);
}

function decodeFloats(value: string, expectedLength: number): Float32Array {
	const bytes = base64.toByteArray(value);
	if (bytes.byteLength !== expectedLength * Float32Array.BYTES_PER_ELEMENT) {
		throw new Error(`Invalid float array length (${bytes.byteLength})`);
	}
	const copy = new Uint8Array(bytes.byteLength);
	copy.set(bytes);
	return new Float32Array(copy.buffer);
}

function finiteNumber(value: unknown, fallback: number): number {
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

class TeachableMachineState implements ISerializer {
	priority = 100;

	classes = $state<TeachableClass[]>(defaultClasses());
	settings = $state<TeachableTrainingSettings>({
		epochs: 60,
		learningRate: 0.05,
		l2: 0.0001,
		batchSize: 16,
		variationsPerSample: 4,
		noiseLayering: false,
	});
	model = $state<TrainedHead | null>(null);

	deviceStatus = $state<DeviceStatus>("disconnected");
	deviceError = $state<string | null>(null);
	recordingClassId = $state<string | null>(null);
	recordingMessage = $state("");
	recordingTotal = $state(0);
	recordingCurrent = $state(0);
	recordingProgress = $state(0);
	recordingReceived = $state(0);
	training = $state(false);
	lossHistory = $state<LossPoint[]>([]);
	listening = $state(false);
	activations = $state<number[]>([]);

	private client: NanoTrainerClient | null = null;
	private stopLive: (() => Promise<void>) | null = null;
	private recordingTimer: ReturnType<typeof setInterval> | null = null;

	get connected(): boolean {
		return this.deviceStatus === "ready";
	}

	get backgroundClass(): TeachableClass {
		return this.classes.find((item) => item.isBackground);
	}

	get canTrain(): boolean {
		return (
			this.classes.length >= 2 &&
			this.classes.every(
				(item) => item.samples.length >= this.minimumSamples(item),
			)
		);
	}

	minimumSamples(item: TeachableClass): number {
		return item.isBackground ? MIN_BACKGROUND_SAMPLES : MIN_CLASS_SAMPLES;
	}

	localizeDefaultClasses(): void {
		if (
			this.model ||
			this.classes.length !== 2 ||
			this.classes.some((item) => item.samples.length > 0)
		) {
			return;
		}

		const regular = this.classes.find((item) => !item.isBackground);
		const background = this.classes.find((item) => item.isBackground);
		if (regular?.name === "Class 1") {
			regular.name = translate("TEACHABLE_MACHINE_DEFAULT_CLASS", {
				number: 1,
			});
		}
		if (background?.name === "Background noise") {
			background.name = translate("TEACHABLE_MACHINE_BACKGROUND_NOISE");
		}
	}

	addClass(): void {
		const backgroundIndex = this.classes.findIndex((item) => item.isBackground);
		const next = createClass(
			translate("TEACHABLE_MACHINE_DEFAULT_CLASS", {
				number: this.classes.length,
			}),
		);
		this.classes.splice(
			backgroundIndex < 0 ? this.classes.length : backgroundIndex,
			0,
			next,
		);
		this.invalidateModel();
	}

	renameClass(classId: string, name: string): void {
		const item = this.classes.find((candidate) => candidate.id === classId);
		if (!item || item.isBackground) return;
		item.name = name;
		this.updateModelHeaders();
	}

	deleteClass(classId: string): void {
		if (this.recordingClassId) return;
		const item = this.classes.find((candidate) => candidate.id === classId);
		if (!item || item.isBackground) return;
		this.classes = this.classes.filter((candidate) => candidate.id !== classId);
		this.invalidateModel();
	}

	deleteSample(classId: string, sampleId: string): void {
		if (this.recordingClassId) return;
		const item = this.classes.find((candidate) => candidate.id === classId);
		if (!item) return;
		item.samples = item.samples.filter((sample) => sample.id !== sampleId);
		this.invalidateModel();
	}

	async connectDevice(): Promise<void> {
		if (this.client || this.deviceStatus !== "disconnected") return;
		this.deviceError = null;
		this.deviceStatus = "connecting";

		try {
			if (!SerialState.port) {
				throw new Error(translate("TEACHABLE_MACHINE_CONNECT_NANO"));
			}
			if (SerialState.board?.id !== robots.l_nano_esp32.id) {
				throw new Error(translate("TEACHABLE_MACHINE_SELECT_NANO"));
			}

			this.deviceStatus = "probing";

			try {
				await this.openTrainerClient(4500);
			} catch {
				await this.closeTrainerClient();
				this.deviceStatus = "flashing";
				await this.flashTrainerFirmware();
				this.deviceStatus = "reconnecting";
				if (!SerialState.port) await SerialState.connect(Prompt.MAYBE);
				await this.openTrainerClient(9000);
			}

			this.deviceStatus = "ready";
		} catch (error) {
			this.deviceError =
				error instanceof Error
					? error.message
					: translate("TEACHABLE_MACHINE_COULD_NOT_CONNECT_NANO");
			await this.disposeDevice();
		}
	}

	async disposeDevice(): Promise<void> {
		await this.stopListening().catch(() => undefined);
		await this.closeTrainerClient();
		this.clearRecordingProgress();
		this.deviceStatus = "disconnected";
		this.recordingClassId = null;
		this.recordingMessage = "";
	}

	async record(classId: string, requestedCount: number): Promise<void> {
		const item = this.classes.find((candidate) => candidate.id === classId);
		if (!item || !this.client || this.recordingClassId) return;
		await this.stopListening().catch(() => undefined);

		this.deviceError = null;
		this.recordingClassId = classId;
		const count = Math.max(1, Math.min(12, Math.round(requestedCount)));
		this.recordingTotal = count;
		this.recordingCurrent = 0;
		this.recordingProgress = 0;
		this.recordingReceived = 0;
		this.recordingMessage = translate(
			count === 1
				? "TEACHABLE_MACHINE_GET_READY_SINGLE"
				: "TEACHABLE_MACHINE_GET_READY_MULTIPLE",
			{ count },
		);

		try {
			await this.client.record(count, {
				onCountdown: (seconds) => {
					this.recordingMessage = translate(
						"TEACHABLE_MACHINE_RECORDING_STARTS_IN",
						{ seconds },
					);
				},
				onRecordingStart: () => {
					this.recordingMessage = translate("TEACHABLE_MACHINE_RECORDING");
					this.startRecordingProgress(count);
				},
				onCaptured: () => {
					this.stopRecordingTimer();
					this.recordingCurrent = count;
					this.recordingProgress = 1;
					this.recordingMessage = translate(
						"TEACHABLE_MACHINE_PROCESSING_AUDIO",
					);
				},
				onSample: (sample, index, total) => {
					item.samples.push(this.createSample(sample));
					this.setModel(null);
					this.lossHistory = [];
					this.recordingReceived = Math.max(this.recordingReceived, index + 1);
					this.recordingCurrent = index + 1;
					this.recordingProgress = 1;
					this.recordingMessage = translate(
						"TEACHABLE_MACHINE_RECEIVING_SAMPLE",
						{ current: index + 1, total },
					);
				},
			});
		} catch (error) {
			this.deviceError =
				error instanceof Error
					? error.message
					: translate("TEACHABLE_MACHINE_RECORDING_FAILED");
		} finally {
			this.clearRecordingProgress();
			this.recordingClassId = null;
			this.recordingMessage = "";
		}
	}

	async train(): Promise<void> {
		if (!this.canTrain || this.training || this.recordingClassId) return;
		await this.stopListening().catch(() => undefined);
		this.training = true;
		this.lossHistory = [];
		this.deviceError = null;

		const samples: TrainingSample[] = this.classes.flatMap((item, label) =>
			item.samples.map((sample) => ({
				label,
				embedding: sample.embedding,
				logMel: sample.logMel,
				isBackground: item.isBackground,
			})),
		);

		try {
			const model = await trainAudioModel(samples, this.classes.length, {
				epochs: Math.max(1, Math.round(this.settings.epochs)),
				learningRate: Math.max(0.000001, this.settings.learningRate),
				l2: Math.max(0, this.settings.l2),
				batchSize: Math.max(1, Math.round(this.settings.batchSize)),
				augmentation: {
					variationsPerSample: Math.max(
						0,
						Math.round(this.settings.variationsPerSample),
					),
					noiseLayering: this.settings.noiseLayering,
				},
				onEpoch: async (epoch, _epochs, loss, accuracy) => {
					this.lossHistory.push({ epoch, loss, accuracy });
					await new Promise<void>((resolve) =>
						requestAnimationFrame(() => resolve()),
					);
				},
			});
			this.setModel(model);
		} catch (error) {
			this.deviceError =
				error instanceof Error
					? error.message
					: translate("TEACHABLE_MACHINE_TRAINING_FAILED");
		} finally {
			this.training = false;
		}
	}

	async startListening(): Promise<void> {
		if (!this.client || !this.model || this.listening) return;
		this.deviceError = null;
		this.activations = new Array(this.classes.length).fill(0);
		try {
			this.stopLive = await this.client.startLive((embedding) => {
				this.activations = Array.from(
					headInfer(
						embedding,
						this.model.weights,
						this.model.bias,
						this.classes.length,
					),
				);
			});
			this.listening = true;
		} catch (error) {
			this.deviceError =
				error instanceof Error
					? error.message
					: translate("TEACHABLE_MACHINE_LISTENING_FAILED");
		}
	}

	async stopListening(): Promise<void> {
		if (this.stopLive) await this.stopLive();
		this.stopLive = null;
		this.listening = false;
		this.activations = new Array(this.classes.length).fill(0);
	}

	save(): SerializedState {
		return {
			version: 1,
			classes: this.classes.map((item) => ({
				id: item.id,
				name: item.name,
				isBackground: item.isBackground,
				samples: item.samples.map((sample) => ({
					id: sample.id,
					embedding: encodeFloats(sample.embedding),
					logMel: encodeFloats(sample.logMel),
				})),
			})),
			settings: { ...this.settings },
			model: this.model
				? {
						weights: encodeFloats(this.model.weights),
						bias: encodeFloats(this.model.bias),
						finalAccuracy: this.model.finalAccuracy,
						realSamples: this.model.realSamples,
						generatedSamples: this.model.generatedSamples,
					}
				: null,
		};
	}

	load(state: object): void {
		try {
			const saved = state as Partial<SerializedState>;
			if (saved.version !== 1 || !Array.isArray(saved.classes)) return;
			const classes = saved.classes.map((item) => ({
				id: typeof item.id === "string" ? item.id : id("class"),
				name:
					typeof item.name === "string"
						? item.name
						: translate("TEACHABLE_MACHINE_UNTITLED_CLASS"),
				isBackground: item.isBackground === true,
				samples: Array.isArray(item.samples)
					? item.samples.map((sample) => ({
							id: typeof sample.id === "string" ? sample.id : id("sample"),
							embedding: decodeFloats(sample.embedding, EMBEDDING_SIZE),
							logMel: decodeFloats(sample.logMel, SPECTROGRAM_SIZE),
						}))
					: [],
			}));

			let background = classes.find((item) => item.isBackground);
			if (!background)
				background = createClass(
					translate("TEACHABLE_MACHINE_BACKGROUND_NOISE"),
					true,
				);
			for (const item of classes) item.isBackground = item === background;
			this.classes = [
				...classes.filter((item) => item !== background),
				background,
			];

			const settings = saved.settings ?? ({} as TeachableTrainingSettings);
			this.settings = {
				epochs: finiteNumber(settings.epochs, 100),
				learningRate: finiteNumber(settings.learningRate, 0.05),
				l2: finiteNumber(settings.l2, 0.0001),
				batchSize: finiteNumber(settings.batchSize, 16),
				variationsPerSample: finiteNumber(settings.variationsPerSample, 3),
				noiseLayering: settings.noiseLayering !== false,
			};

			const model = saved.model;
			this.setModel(
				model
					? {
							weights: decodeFloats(
								model.weights,
								this.classes.length * EMBEDDING_SIZE,
							),
							bias: decodeFloats(model.bias, this.classes.length),
							finalAccuracy: finiteNumber(model.finalAccuracy, 0),
							realSamples: finiteNumber(model.realSamples, 0),
							generatedSamples: finiteNumber(model.generatedSamples, 0),
						}
					: null,
			);
		} catch (error) {
			console.warn("Could not restore Teachable Machine state", error);
			this.clear();
		}
	}

	clear(): void {
		this.classes = defaultClasses();
		this.settings = {
			epochs: 60,
			learningRate: 0.05,
			l2: 0.0001,
			batchSize: 16,
			variationsPerSample: 4,
			noiseLayering: false,
		};
		this.setModel(null);
		this.lossHistory = [];
		this.activations = [];
	}

	private createSample(sample: NanoSample): TeachableSample {
		return {
			id: id("sample"),
			embedding: Float32Array.from(sample.embedding),
			logMel: Float32Array.from(sample.logMel),
		};
	}

	private invalidateModel(): void {
		this.setModel(null);
		this.lossHistory = [];
		void this.stopListening().catch(() => undefined);
	}

	private setModel(model: TrainedHead | null): void {
		this.model = model;
		this.updateModelHeaders();
	}

	private updateModelHeaders(): void {
		if (!this.model) {
			arduino.teachableMachineModelHeaders = null;
			return;
		}

		arduino.teachableMachineModelHeaders = generateModelHeader(this.model, {
			classNames: this.classes.map((item) => item.name),
			backgroundIndex: this.classes.findIndex((item) => item.isBackground),
			threshold: 0.6,
		});
	}

	private async openTrainerClient(timeout: number): Promise<void> {
		const port = SerialState.port;
		if (!port)
			throw new Error(translate("TEACHABLE_MACHINE_SERIAL_DISCONNECTED"));
		if (port.readable || port.writable) await port.close();
		const client = new NanoTrainerClient(port as unknown as SerialPortLike);
		this.client = client;
		await client.connect(timeout);
	}

	private async closeTrainerClient(): Promise<void> {
		const client = this.client;
		this.client = null;
		if (client) await client.disconnect().catch(() => undefined);
	}

	private startRecordingProgress(total: number): void {
		this.stopRecordingTimer();
		const started = performance.now();
		this.recordingCurrent = 1;
		this.recordingTimer = setInterval(() => {
			const elapsed = (performance.now() - started) / 1000;
			this.recordingCurrent = Math.min(total, Math.floor(elapsed) + 1);
			this.recordingProgress = Math.min(1, elapsed % 1);
			if (elapsed >= total) {
				this.recordingCurrent = total;
				this.recordingProgress = 1;
				this.stopRecordingTimer();
			}
		}, 50);
	}

	private stopRecordingTimer(): void {
		if (this.recordingTimer) clearInterval(this.recordingTimer);
		this.recordingTimer = null;
	}

	private clearRecordingProgress(): void {
		this.stopRecordingTimer();
		this.recordingTotal = 0;
		this.recordingCurrent = 0;
		this.recordingProgress = 0;
		this.recordingReceived = 0;
	}

	private async flashTrainerFirmware(): Promise<void> {
		const response = await fetch(trainerFirmwareUrl);
		if (!response.ok)
			throw new Error(translate("TEACHABLE_MACHINE_FIRMWARE_LOAD_FAILED"));
		const firmware = new Uint8Array(await response.arrayBuffer());
		await PopupState.open({
			component: Uploader,
			data: {
				program: { sketch: base64.fromByteArray(firmware) },
				useReservedPort: true,
			},
			allowInteraction: false,
		});
	}
}

export default new TeachableMachineState();
