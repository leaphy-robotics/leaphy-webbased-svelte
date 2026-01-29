import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Uploader from "$components/core/popups/popups/Uploader.svelte";
import Collect from "$components/workspace/ml/flow/Collect.svelte";
import Result from "$components/workspace/ml/flow/Result.svelte";
import Setup from "$components/workspace/ml/flow/Setup.svelte";
import Train from "$components/workspace/ml/flow/Train.svelte";
import ExtensionState from "$domain/blockly/extensions.svelte";
import AppState from "$state/app.svelte";
import BlocklyState from "$state/blockly.svelte";
import { BluetoothWriteQueue } from "$state/bluetooth.svelte";
import WorkspaceState from "$state/workspace.svelte";
import { arduino } from "@leaphy-robotics/leaphy-blocks";
import {
	type Class,
	type DataFrame,
	type Dataset,
	ml,
} from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import type { Sensor } from "@leaphy-robotics/leaphy-blocks/src/categories/ml/sensors";
import * as tf from "@tensorflow/tfjs";
import type { LayersModel, Tensor } from "@tensorflow/tfjs";
import type { Component } from "svelte";
import { _ } from "svelte-i18n";
import { get } from "svelte/store";
import PopupState from "./popup.svelte";

export const Step = {
	SETUP: Setup as Component,
	COLLECT: Collect as Component,
	TRAIN: Train as Component,
	RESULT: Result as Component,
};

export const steps = [Step.SETUP, Step.COLLECT, Step.TRAIN, Step.RESULT];

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
	connected = $state(false);
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
	snapshot: { id: string; type: Sensor; settings: unknown; values: number[] }[] = $state([]);

	datasets = $state<Dataset[]>([]);
	sensors = $state<{ id: string; type: Sensor; settings: unknown }[]>([]);
	data: DataFrame[] = [];

	available: number[] = $state([]);
	distribution: string[] = $state([]);

	epochs = $state("50");

	confusion: number[][] = $state([]);

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

			if (this.datasets.length > 0 && this.maxStep <= 1) ml.maxStep++;
			if (this.datasets.length === 0 && this.maxStep >= 1) ml.maxStep = 1;
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

	async learn() {
		await this.setClassification(null);

		if (this.learning) {
			this.datasets.push(ml.datasets.createItem(this.data));
			this.learning = false;
			return;
		}

		this.learning = true;
	}

	// Web Bluetooth API integration for real-time sensor data streaming
	async connect() {
		this.connected = false;
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

		const device = await navigator.bluetooth.requestDevice({
			filters: [
				{
					services: [ml.trainingID],
				},
			],
		});
		device.addEventListener("gattserverdisconnected", () => {
			this.connected = false;
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
			},
		);

		this.connected = true;
	}

	processSnapshot(snapshot: number[]) {
		let offset = 0;
		
		return this.sensors.map((sensor) => {
			const values = snapshot.slice(offset, offset + sensor.type.values);
			offset += sensor.type.values;
			return {
				...sensor,
				values,
			}
		})
	}

	async upload() {
		await PopupState.open({
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
	}

	// Complete TensorFlow.js training pipeline with async generator pattern for progress tracking
	async *train() {
		yield { title: "ML_TRAINING", progress: 0 };

		const inputSize = this.sensors.reduce((acc, sensor) => acc + sensor.type.values, 0);
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
				tf.layers.dense({ units: this.classes.length, activation: "softmax" }),
			],
		});
		this.model.compile({
			optimizer: "adam",
			loss: "categoricalCrossentropy",
			metrics: ["accuracy"],
		});

		// Balanced dataset creation with random sampling
		const frames = this.classes
			.flatMap((classData, i) => {
				const frames = ml.datasets
					.getItems()
					.flatMap((dataset) => dataset.getDataForClass(classData.id))
					.map((frame) => {
						frame.input = frame.input.slice(0, inputSize);
						return frame;
					});

				return getRandomItems(frames, Number.parseInt(this.distribution[i]));
			})
			.map((frame) => ({
				...frame,
				output: this.classes.map((classData) =>
					classData.id === frame.detected ? 1 : 0,
				),
			}));

		tf.util.shuffle(frames);
		const data = tf.tensor2d(frames.map((frame) => frame.input));
		const labels = tf.tensor2d(frames.map((frame) => frame.output));

		const trainSize = Math.ceil(data.shape[0] * 0.9);
		const [trainingData, testData] = tf.split(data, [
			trainSize,
			data.shape[0] - trainSize,
		]);
		const [trainingLabels, testLabels] = tf.split(labels, [
			trainSize,
			data.shape[0] - trainSize,
		]);

		// Async generator pattern for streaming training progress
		const queue: { title: string; progress: number }[] = [];
		let trainingDone = false;
		let resolveNext: () => void;
		this.model
			.fit(trainingData, trainingLabels, {
				epochs: Number.parseInt(this.epochs),
				callbacks: {
					onEpochEnd: (epoch) => {
						queue.push({
							title: `${get(_)("ML_TRAINING")} (epoch ${epoch + 1}/${this.epochs})`,
							progress: (75 / Number.parseInt(this.epochs)) * (epoch + 1),
						});
						if (resolveNext) resolveNext();
					},
				},
			})
			.then(() => {
				trainingDone = true;
				resolveNext();
			});

		while (!trainingDone || queue.length > 0) {
			if (queue.length > 0) {
				yield queue.shift();
			} else {
				await new Promise<void>((resolve) => (resolveNext = resolve));
			}
		}

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

		// TensorFlow Lite conversion for Arduino deployment
		yield { title: "ML_CONVERTING", progress: 75 };

		const SAVE_URL = `${import.meta.env.VITE_BACKEND_URL}/ml/convert`;
		if (tf.io.getSaveHandlers(SAVE_URL).length === 0) {
			tf.io.registerSaveRouter(tf.io.browserHTTPRequest);
		}

		const res = await this.model.save(
			`${import.meta.env.VITE_BACKEND_URL}/ml/convert`,
		);
		ml.modelHeaders = await res.responses[0].json();

		yield { title: "DONE", progress: 100 };
		ml.maxStep++;
	}

	next() {
		if (this.stepIndex >= this.maxStep) return;

		this.stepIndex++;
	}

	previous() {
		if (this.stepIndex <= 0) return;

		this.stepIndex--;
	}
}

export default new MLState();
