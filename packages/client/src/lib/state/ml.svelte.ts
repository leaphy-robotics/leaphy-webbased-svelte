import { arduino } from "@leaphy-robotics/leaphy-blocks";
import {
	type Class,
	type DataFrame,
	type Dataset,
	ml,
} from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import type { Sensor } from "@leaphy-robotics/leaphy-blocks/src/categories/ml/sensors";
import type { LayersModel, Tensor } from "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs";
import type { Component } from "svelte";
import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Collect from "$components/workspace/ml/flow/Collect.svelte";
import Result from "$components/workspace/ml/flow/Result.svelte";
import Setup from "$components/workspace/ml/flow/Setup.svelte";
import Train from "$components/workspace/ml/flow/Train.svelte";
import ExtensionState from "$domain/blockly/extensions.svelte";
import { afterPaint } from "$domain/paint";
import { useTrainingBackend } from "$domain/tensorflow";
import AppState from "$state/app.svelte";
import BlocklyState from "$state/blockly.svelte";
import { BluetoothWriteQueue } from "$state/bluetooth.svelte";
import { isBluetoothCancel } from "$state/utils";
import WorkspaceState from "$state/workspace.svelte";
import Uploader from "../components/core/popups/popups/uploaders/Uploader.svelte";
import PopupState from "./popup.svelte";

export const Step = {
	SETUP: Setup as Component,
	COLLECT: Collect as Component,
	TRAIN: Train as Component,
	RESULT: Result as Component,
};

export const steps = [Step.SETUP, Step.COLLECT, Step.TRAIN, Step.RESULT];

// Below this amount of examples per class a model will mostly memorize instead of learn
export const MIN_SAMPLES_PER_CLASS = 10;
// Share of every class that is kept apart to test the model with examples it has never seen
const TEST_SHARE = 0.2;

export type ConnectionState =
	| "disconnected"
	| "connecting"
	| "connected"
	| "lost"
	| "error";

export type TrainingState =
	| "idle"
	| "training"
	| "converting"
	| "done"
	| "error";

export type UploadState = "idle" | "uploading" | "success" | "error";

export interface TranslatedMessage {
	key: string;
	values?: Record<string, string | number>;
}

export interface TrainingPoint {
	epoch: number;
	loss: number;
	accuracy: number;
}

function getRandomItems<T>(array: T[], count: number): T[] {
	if (count >= array.length) {
		return [...array];
	}

	if (count <= 0) {
		return [];
	}

	const result: T[] = [];
	const arrayCopy = [...array];

	for (let i = 0; i < count; i++) {
		const randomIndex = Math.floor(Math.random() * arrayCopy.length);
		result.push(arrayCopy.splice(randomIndex, 1)[0]);
	}

	return result;
}

// Parses binary Float32 sensor data from Bluetooth communication
function readFloat32Array(view: DataView) {
	const result: number[] = [];
	for (let offset = 0; offset < view.byteLength; offset += 4) {
		result.push(view.getFloat32(offset, true));
	}

	return result;
}

// Reactive state management for complete ML workflow using Svelte 5 runes
class MLState {
	// Important: persistent state should not be directly updated on this class in order to ensure consistent project serialization, use utilities and setters from the ML class contained in the Blockly category instead

	enabled = $derived(ExtensionState.isEnabled("l_ml"));
	stepIndex = $state(0);
	maxStep = $state(0);
	// Derived reactive value that updates when stepIndex changes
	step = $derived(steps[this.stepIndex]);
	classes = $state<Class[]>([]);
	connectionState = $state<ConnectionState>("disconnected");
	connectionError = $state<string | null>(null);
	connected = $derived(this.connectionState === "connected");
	structure = $state([
		{ units: 9, activation: "relu" },
		{ units: 6, activation: "relu" },
	]);

	model = $state<LayersModel>(null);

	classification: string = $state(null);
	manual = $state(false);

	// Bluetooth LE communication handles for real-time data streaming
	inputCharacteristic: BluetoothRemoteGATTCharacteristic;
	outputCharacteristic: BluetoothRemoteGATTCharacteristic;
	queue = new BluetoothWriteQueue();

	learning = $state(false);
	// Amount of examples recorded per class in the current recording session
	sessionCounts = $state<Record<string, number>>({});
	recordingNotice = $state<TranslatedMessage | null>(null);
	snapshot: {
		id: string;
		type: Sensor;
		settings: unknown;
		values: number[];
	}[] = $state([]);

	datasets = $state<Dataset[]>([]);
	sensors = $state<{ id: string; type: Sensor; settings: unknown }[]>([]);
	data: DataFrame[] = [];

	available: number[] = $state([]);
	distribution: string[] = $state([]);

	epochs = $state(50);

	confusion: number[][] = $state([]);

	trainingState = $state<TrainingState>("idle");
	trainingHistory = $state<TrainingPoint[]>([]);
	trainingError = $state<string | null>(null);

	collectorUpload = $state<UploadState>("idle");
	modelUpload = $state<UploadState>("idle");

	hasSensors = $derived(this.sensors.length > 0);
	collectorUploaded = $derived(this.maxStep >= 1);
	hasData = $derived(this.datasets.length > 0);
	isTrained = $derived(this.maxStep >= 3);
	// Problems that should be solved before training makes sense
	trainingIssues = $derived(this.getTrainingIssues());

	async setClassification(classification: string | null) {
		if (this.classification === classification) return;

		this.classification = classification;

		if (this.manual) return;

		const buffer = new Uint8Array(this.classes.length);
		if (classification) {
			buffer[
				this.classes.findIndex((classData) => classData.id === classification)
			] = 1;
		}

		this.queue.write(this.outputCharacteristic, buffer);
	}

	constructor() {
		// Keyboard-driven data labeling during collection
		document.body.addEventListener("keydown", async (e) => {
			if (!this.learning) return;

			const triggered = ml.classes
				.getItems()
				.find((classData) => classData.key === e.code);
			if (!triggered) return;

			await this.setClassification(triggered.id);
		});

		document.body.addEventListener("keyup", async (e) => {
			if (!this.learning) return;

			const triggered = ml.classes
				.getItems()
				.find((classData) => classData.key === e.code);
			if (!triggered || triggered.id !== this.classification) return;

			await this.setClassification(null);
		});

		// Event-driven synchronization with core ML system
		ml.addEventListener("updateDatasets", () => {
			this.datasets = ml.datasets.getItems();
			this.computeDistribution();

			// Recorded examples unlock training, removing all of them locks it again
			if (this.datasets.length > 0 && this.maxStep === 1) ml.maxStep = 2;
			if (this.datasets.length === 0 && this.maxStep > 1) ml.maxStep = 1;
		});
		ml.addEventListener("updateClasses", () => {
			this.classes = ml.classes.getItems();
			this.computeDistribution();
		});
		ml.addEventListener(
			"updateSensors",
			() => (this.sensors = ml.sensors.getItems()),
		);
		ml.addEventListener("updateMaxStep", () => {
			this.maxStep = ml.maxStep;
			if (this.stepIndex > this.maxStep) {
				this.stepIndex = this.maxStep;
			}
		});
		ml.addEventListener(
			"updateConfusion",
			() => (this.confusion = ml.confusion),
		);
		ml.addEventListener(
			"updateStructure",
			() => (this.structure = ml.structure),
		);
	}

	computeDistribution() {
		this.available = this.classes.map((classData) => {
			return this.datasets.flatMap((dataset) =>
				dataset.getDataForClass(classData.id),
			).length;
		});
		this.distribution = new Array(this.classes.length).fill(
			Math.min(...this.available),
		);
	}

	getTrainingIssues(): TranslatedMessage[] {
		const issues: TranslatedMessage[] = [];
		this.classes.forEach((classData, index) => {
			const available = this.available[index] ?? 0;
			if (available < MIN_SAMPLES_PER_CLASS) {
				issues.push({
					key: "ML_ISSUE_TOO_FEW_EXAMPLES",
					values: {
						name: classData.name,
						count: available,
						minimum: MIN_SAMPLES_PER_CLASS,
					},
				});
			}
		});

		return issues;
	}

	async learn() {
		await this.setClassification(null);

		if (this.learning) {
			this.stopLearning();
			return;
		}

		this.data = [];
		this.sessionCounts = {};
		this.recordingNotice = null;
		this.learning = true;
	}

	// Stores everything recorded in this session as a new dataset
	stopLearning() {
		this.learning = false;
		if (this.data.length === 0) {
			this.recordingNotice = { key: "ML_NOTHING_RECORDED" };
			return;
		}

		ml.datasets.createItem(this.data);
		this.recordingNotice = {
			key: "ML_RECORDING_SAVED",
			values: { count: this.data.length },
		};
		this.data = [];
	}

	// Web Bluetooth API integration for real-time sensor data streaming
	async connect() {
		if (this.connectionState === "connecting") return;
		if (!("bluetooth" in navigator)) {
			await PopupState.open({
				component: ErrorPopup,
				data: {
					title: "NO_BLUETOOTH_TITLE",
					message: "NO_BLUETOOTH_MESSAGE",
				},
				allowInteraction: false,
			});
			return;
		}

		try {
			const device = await navigator.bluetooth.requestDevice({
				filters: [
					{
						services: [ml.trainingID],
					},
				],
			});
			await this.setupDevice(device);
		} catch (e) {
			if (isBluetoothCancel(e)) return;

			console.warn("Unable to connect over Bluetooth", e);
			PopupState.open({
				component: ErrorPopup,
				data: {
					title: "BLUETOOTH_CONNECT_FAILED_TITLE",
					message: "BLUETOOTH_CONNECT_FAILED_MESSAGE",
				},
				allowInteraction: false,
			});
		}
	}

	private async setupDevice(device: BluetoothDevice) {
		device.addEventListener("gattserverdisconnected", () => {
			this.connected = false;
		});

		try {
			const device = await navigator.bluetooth.requestDevice({
				filters: [
					{
						services: [ml.trainingID],
					},
				],
			});
			device.addEventListener("gattserverdisconnected", () => {
				if (this.learning) this.stopLearning();
				this.connectionState = "lost";
			});

			const gatt = await device.gatt.connect();
			const service = await gatt.getPrimaryService(ml.trainingID);

			this.outputCharacteristic = await service.getCharacteristic(
				"6f1c1de7-bc7d-4bcb-a30e-918b82d115e8",
			);

			this.inputCharacteristic = await service.getCharacteristic(
				"f0e84eb0-f3ed-495c-926c-b2e3815415a7",
			);
			await this.inputCharacteristic.startNotifications();
		} catch (e) {
			// The user closed the device chooser, this is not an error
			if (isBluetoothCancel(e)) {
				this.connectionState = "disconnected";
				return;
			}

			console.error(e);
			this.connectionState = "error";
			this.connectionError = e instanceof Error ? e.message : String(e);
			return;
		}

		let pages = [];
		this.inputCharacteristic.addEventListener(
			"characteristicvaluechanged",
			async (e) => {
				const value = (e.target as unknown as { value: DataView }).value;
				const input = readFloat32Array(value).slice(1);

				const pageIndex = value.getUint8(0);
				const pageCount = value.getUint8(1);

				if (pages.length === 0) {
					pages = new Array(pageCount).fill(null);
				}

				pages[pageIndex] = input;

				if (!pages.every((page) => page !== null)) {
					return;
				}

				const data = pages.flat();
				this.snapshot = this.processSnapshot(data);
				pages = [];

				if (!this.classification || !this.learning) return;

				this.data.push({ input: data, detected: this.classification });
				this.sessionCounts[this.classification] =
					(this.sessionCounts[this.classification] ?? 0) + 1;
			},
		);

		this.connectionState = "connected";
	}

	processSnapshot(snapshot: number[]) {
		let offset = 0;

		return this.sensors.map((sensor) => {
			const values = snapshot.slice(offset, offset + sensor.type.values);
			offset += sensor.type.values;
			return {
				...sensor,
				values,
			};
		});
	}

	// Returns whether the program was uploaded successfully
	async upload(): Promise<boolean> {
		const success = await PopupState.open({
			component: Uploader,
			data: {
				getCode: () => {
					const code = arduino.workspaceToCode(BlocklyState.workspace);
					AppState.libraries.clear();
					AppState.libraries.install(...arduino.getDependencies());

					return code;
				},
			},
			allowInteraction: false,
		});

		return success === true;
	}

	async uploadCollector() {
		this.collectorUpload = "uploading";
		ml.generateInference = false;
		const success = await this.upload();
		this.collectorUpload = success ? "success" : "error";
		if (success && ml.maxStep === 0) ml.maxStep = 1;
	}

	async uploadModel() {
		this.modelUpload = "uploading";
		ml.generateInference = true;
		try {
			const success = await this.upload();
			this.modelUpload = success ? "success" : "error";
		} finally {
			ml.generateInference = false;
		}
	}

	// Splits the examples of every class so each class is represented in both the training and test set
	prepareData(inputSize: number) {
		const train: { input: number[]; output: number[] }[] = [];
		const test: { input: number[]; output: number[] }[] = [];

		this.classes.forEach((classData, i) => {
			const frames = getRandomItems(
				ml.datasets
					.getItems()
					.flatMap((dataset) => dataset.getDataForClass(classData.id)),
				Number(this.distribution[i]),
			).map((frame) => ({
				input: frame.input.slice(0, inputSize),
				output: this.classes.map((_, index) => (index === i ? 1 : 0)),
			}));

			const testCount = Math.max(1, Math.round(frames.length * TEST_SHARE));
			test.push(...frames.slice(0, testCount));
			train.push(...frames.slice(testCount));
		});

		tf.util.shuffle(train);
		return { train, test };
	}

	// Complete TensorFlow.js training pipeline, progress is exposed through reactive state
	async train() {
		if (
			this.trainingState === "training" ||
			this.trainingState === "converting"
		)
			return;

		this.trainingState = "training";
		this.trainingHistory = [];
		this.trainingError = null;
		this.modelUpload = "idle";
		await afterPaint();

		try {
			await useTrainingBackend();
			const inputSize = this.sensors.reduce(
				(acc, sensor) => acc + sensor.type.values,
				0,
			);
			this.model?.dispose();
			this.model = tf.sequential({
				layers: [
					...ml.structure.map((layer, index) => {
						if (index === 0)
							return tf.layers.dense({
								inputShape: [inputSize],
								...layer,
							});

						return tf.layers.dense(layer);
					}),
					tf.layers.dense({
						units: this.classes.length,
						activation: "softmax",
					}),
				],
			});
			this.model.compile({
				optimizer: "adam",
				loss: "categoricalCrossentropy",
				metrics: ["accuracy"],
			});

			const { train, test } = this.prepareData(inputSize);
			const trainingData = tf.tensor2d(train.map((frame) => frame.input));
			const trainingLabels = tf.tensor2d(train.map((frame) => frame.output));
			const testData = tf.tensor2d(test.map((frame) => frame.input));
			const testLabels = tf.tensor2d(test.map((frame) => frame.output));

			await this.model.fit(trainingData, trainingLabels, {
				epochs: this.epochs,
				yieldEvery: "epoch",
				callbacks: {
					onEpochEnd: async (epoch, logs) => {
						this.trainingHistory.push({
							epoch: epoch + 1,
							loss: logs?.loss ?? 0,
							accuracy: logs?.acc ?? logs?.accuracy ?? 0,
						});
						// Give the browser time to show the progress
						await afterPaint();
					},
				},
			});

			// Confusion matrix generation for model evaluation
			const predictions = this.model.predict(testData) as Tensor;
			const confusion = tf.math.confusionMatrix(
				testLabels.argMax(1).as1D(),
				predictions.argMax(1).as1D(),
				this.classes.length,
			);
			const rowSums = confusion.sum(1, true);
			const normalizedConfusion = confusion.toFloat().div(rowSums);
			ml.confusion = (await normalizedConfusion.array()) as number[][];
			tf.dispose([
				trainingData,
				trainingLabels,
				testData,
				testLabels,
				predictions,
				confusion,
				rowSums,
				normalizedConfusion,
			]);

			// TensorFlow Lite conversion for Arduino deployment
			this.trainingState = "converting";
			await afterPaint();

			const SAVE_URL = `${import.meta.env.VITE_BACKEND_URL}/ml/convert`;
			if (tf.io.getSaveHandlers(SAVE_URL).length === 0) {
				tf.io.registerSaveRouter(tf.io.browserHTTPRequest);
			}

			const res = await this.model.save(SAVE_URL);
			const response = res.responses?.[0];
			if (!response?.ok) throw new Error("ML_CONVERSION_FAILED");
			ml.modelHeaders = await response.json();

			this.trainingState = "done";
			ml.maxStep = Math.max(ml.maxStep, steps.length - 1);
		} catch (e) {
			console.error(e);
			this.trainingState = "error";
			// Network errors from fetch are TypeErrors, these mean the conversion server could not be reached
			this.trainingError =
				e instanceof TypeError
					? "NO_INTERNET"
					: e instanceof Error
						? e.message
						: String(e);
		}
	}

	goTo(index: number) {
		if (index < 0 || index > this.maxStep || index >= steps.length) return;

		this.stepIndex = index;
	}

	next() {
		if (this.stepIndex >= this.maxStep || this.stepIndex >= steps.length - 1)
			return;

		this.stepIndex++;
	}

	previous() {
		if (this.stepIndex <= 0) return;

		this.stepIndex--;
	}
}

export default new MLState();
