/**
 * Svelte state management for Machine Learning functionality.
 *
 * This module provides reactive state management for the ML workflow in the Svelte client.
 * It handles the complete ML pipeline including:
 * - Multi-step workflow management (setup, collect, train, result)
 * - Bluetooth communication with Arduino devices
 * - Data collection and labeling
 * - Model training using TensorFlow.js
 * - Model conversion and deployment
 *
 * The state is reactive using Svelte 5's runes system for real-time UI updates.
 */

import Uploader from "$components/core/popups/popups/Uploader.svelte";
import Collect from "$components/workspace/ml/flow/Collect.svelte";
import Result from "$components/workspace/ml/flow/Result.svelte";
import Setup from "$components/workspace/ml/flow/Setup.svelte";
import Train from "$components/workspace/ml/flow/Train.svelte";
import AppState from "$state/app.svelte";
import BlocklyState from "$state/blockly.svelte";
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
import type { Tensor } from "@tensorflow/tfjs";
import type { Component } from "svelte";
import { _ } from "svelte-i18n";
import { get } from "svelte/store";
import PopupState from "./popup.svelte";

/** Available workflow steps as Svelte components */
export const Step = {
	SETUP: Setup as Component,
	COLLECT: Collect as Component,
	TRAIN: Train as Component,
	RESULT: Result as Component,
};

/** Ordered array of workflow steps */
export const steps = [Step.SETUP, Step.COLLECT, Step.TRAIN, Step.RESULT];

/**
 * Utility function to randomly sample items from an array.
 * Used for creating balanced training datasets.
 * @param array The array to sample from
 * @param count Number of items to sample
 * @returns Array of randomly selected items
 */
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

/**
 * Utility function to read Float32 values from a DataView.
 * Used for parsing Bluetooth sensor data from Arduino.
 * @param view DataView containing the binary float data
 * @returns Array of parsed float values
 */
function readFloat32Array(view: DataView) {
	const result: number[] = [];
	for (let offset = 0; offset < view.byteLength; offset += 4) {
		result.push(view.getFloat32(offset, true));
	}

	return result;
}

/**
 * Main ML state management class for the Svelte client.
 *
 * Manages the complete ML workflow including:
 * - Workflow step navigation
 * - Bluetooth communication with Arduino devices
 * - Data collection and labeling
 * - Model training and evaluation
 * - Model deployment
 *
 * Uses Svelte 5 runes for reactive state management.
 */
class MLState {
	/** Whether ML functionality is enabled */
	enabled = $state(false);
	/** Current step index in the workflow */
	stepIndex = $state(0);
	/** Maximum step that can be accessed */
	maxStep = $state(0);
	/** Current workflow step component */
	step = $derived(steps[this.stepIndex]);
	/** Available classification classes */
	classes = $state<Class[]>([]);
	/** Whether connected to Arduino via Bluetooth */
	connected = $state(false);
	/** Neural network structure configuration */
	structure = $state([
		{ units: 9, activation: "relu" },
		{ units: 6, activation: "relu" },
	]);

	/** Currently selected classification (null = no classification) */
	classification: string = $state(null);
	/** Whether manual classification mode is enabled */
	manual = $state(false);

	/** Bluetooth characteristics for communication */
	inputCharacteristic: BluetoothRemoteGATTCharacteristic;
	outputWriter: WritableStreamDefaultWriter<Uint8Array>;

	/** Whether currently in learning/data collection mode */
	learning = $state(false);
	/** Current sensor readings snapshot */
	snapshot: number[] = $state([]);

	/** Collected datasets */
	datasets = $state<Dataset[]>([]);
	/** Configured sensors */
	sensors = $state<{ id: string; type: Sensor; settings: unknown }[]>([]);
	/** Temporary data collection buffer */
	data: DataFrame[] = [];

	/** Available data counts per class */
	available: number[] = $state([]);
	/** Desired data distribution per class */
	distribution: string[] = $state([]);

	/** Number of training epochs */
	epochs = $state("100");

	/** Model evaluation confusion matrix */
	confusion: number[][] = $state([]);

	/**
	 * Sets the current classification and communicates it to the Arduino.
	 * @param classification The class ID to set as active, or null to clear
	 */
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

		await this.outputWriter.write(buffer);
	}

	/**
	 * Initializes the ML state and sets up event listeners.
	 * Handles keyboard shortcuts for data labeling and syncs with the core ML system.
	 */
	constructor() {
		// Set up keyboard event handlers for data collection
		document.body.addEventListener("keydown", async (e) => {
			if (!this.learning) return;

			const triggered = ml
				.getClasses()
				.find((classData) => classData.key === e.code);
			if (!triggered) return;

			await this.setClassification(triggered.id);
		});

		document.body.addEventListener("keyup", async (e) => {
			if (!this.learning) return;

			const triggered = ml
				.getClasses()
				.find((classData) => classData.key === e.code);
			if (!triggered || triggered.id !== this.classification) return;

			await this.setClassification(null);
		});

		// Sync with core ML system events
		ml.addEventListener("updateDatasets", () => {
			this.datasets = ml.getDatasets();
			this.computeDistribution();

			if (this.datasets.length > 0 && this.maxStep <= 1) ml.maxStep++;
			if (this.datasets.length === 0 && this.maxStep >= 1) ml.maxStep = 1;
		});
		ml.addEventListener("updateClasses", () => {
			this.classes = ml.getClasses();
			this.computeDistribution();
		});
		ml.addEventListener(
			"updateSensors",
			() => (this.sensors = ml.getSensors()),
		);
		ml.addEventListener("updateEnabled", () => (this.enabled = ml.enabled));
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

	/**
	 * Computes the data distribution for balanced training.
	 * Calculates available data per class and determines target distribution.
	 */
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

	/**
	 * Toggles data collection mode.
	 * When starting, begins data collection. When stopping, saves collected data as a dataset.
	 */
	async learn() {
		await this.setClassification(null);

		if (this.learning) {
			this.datasets.push(ml.addDataset(this.data));
			this.learning = false;
			return;
		}

		this.learning = true;
	}

	/**
	 * Establishes Bluetooth connection with the Arduino device.
	 * Sets up input/output characteristics for data streaming and classification feedback.
	 */
	async connect() {
		this.connected = false;
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

		// Set up output characteristic for sending classification labels
		const outputCharacteristic = await service.getCharacteristic(
			"6f1c1de7-bc7d-4bcb-a30e-918b82d115e8",
		);
		this.outputWriter = new WritableStream<Uint8Array>({
			async write(chunk) {
				await Promise.race([
					outputCharacteristic.writeValue(chunk),
					new Promise((resolve) => setTimeout(resolve, 250)),
				]);
			},
		}).getWriter();

		// Set up input characteristic for receiving sensor data
		this.inputCharacteristic = await service.getCharacteristic(
			"f0e84eb0-f3ed-495c-926c-b2e3815415a7",
		);
		await this.inputCharacteristic.startNotifications();
		this.inputCharacteristic.addEventListener(
			"characteristicvaluechanged",
			async (e) => {
				const input = readFloat32Array(
					(e.target as unknown as { value: DataView }).value,
				);

				this.snapshot = input;
				if (!this.classification || !this.learning) return;

				this.data.push({ input, detected: this.classification });
			},
		);

		this.connected = true;
	}

	/**
	 * Uploads the generated Arduino code to the device.
	 * Generates code based on current workspace and robot configuration.
	 */
	async upload() {
		const code = arduino.workspaceToCode(
			BlocklyState.workspace,
			WorkspaceState.robot.id,
		);
		AppState.libraries.clear();
		AppState.libraries.install(...arduino.getDependencies());

		await PopupState.open({
			component: Uploader,
			data: {
				source: code,
			},
			allowInteraction: false,
		});
	}

	/**
	 * Trains the machine learning model using TensorFlow.js.
	 *
	 * This async generator function yields progress updates during training:
	 * 1. Model creation and compilation
	 * 2. Data preparation and shuffling
	 * 3. Training with progress callbacks
	 * 4. Model evaluation and confusion matrix generation
	 * 5. Model conversion to C++ headers for Arduino deployment
	 *
	 * @yields Progress objects with title and completion percentage
	 */
	async *train() {
		yield { title: "ML_TRAINING", progress: 0 };

		// Create neural network model
		const model = tf.sequential({
			layers: [
				...ml.structure.map((layer, index) => {
					if (index === 0)
						return tf.layers.dense({
							inputShape: [this.sensors.length],
							...layer,
						});

					return tf.layers.dense(layer);
				}),
				tf.layers.dense({ units: this.classes.length, activation: "softmax" }),
			],
		});
		model.compile({
			optimizer: "adam",
			loss: "categoricalCrossentropy",
			metrics: ["accuracy"],
		});

		// Prepare balanced training data
		const frames = this.classes
			.flatMap((classData, i) => {
				const frames = ml
					.getDatasets()
					.flatMap((dataset) => dataset.getDataForClass(classData.id));

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

		// Split into training and testing sets (90/10)
		const trainSize = Math.ceil(data.shape[0] * 0.9);
		const [trainingData, testData] = tf.split(data, [
			trainSize,
			data.shape[0] - trainSize,
		]);
		const [trainingLabels, testLabels] = tf.split(labels, [
			trainSize,
			data.shape[0] - trainSize,
		]);

		// Train model with progress tracking
		const queue: { title: string; progress: number }[] = [];
		let trainingDone = false;
		let resolveNext: () => void;
		model
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

		// Evaluate model and generate confusion matrix
		const predictions = model.predict(testData) as Tensor;
		const confusion = tf.math.confusionMatrix(
			testLabels.argMax(1).as1D(),
			predictions.argMax(1).as1D(),
			this.classes.length,
		);
		const rowSums = confusion.sum(1, true);
		const normalizedConfusion = confusion.toFloat().div(rowSums);
		ml.confusion = (await normalizedConfusion.array()) as number[][];

		// Convert model to Arduino-compatible format
		yield { title: "ML_CONVERTING", progress: 75 };
		const res = await model.save(
			`${import.meta.env.VITE_BACKEND_URL}/ml/convert`,
		);
		ml.modelHeaders = await res.responses[0].json();

		yield { title: "DONE", progress: 100 };
		ml.maxStep++;
	}

	/**
	 * Advances to the next step in the workflow if possible.
	 */
	next() {
		if (this.stepIndex >= this.maxStep) return;

		this.stepIndex++;
	}

	/**
	 * Goes back to the previous step in the workflow if possible.
	 */
	previous() {
		if (this.stepIndex <= 0) return;

		this.stepIndex--;
	}
}

/** Global ML state instance for the Svelte client */
export default new MLState();
