import Setup from "$components/workspace/ml/flow/Setup.svelte";
import Collect from "$components/workspace/ml/flow/Collect.svelte";
import {type Component} from "svelte";
import {type Class, type DataFrame, Dataset, ml} from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import * as tf from '@tensorflow/tfjs';
import WorkspaceState from "$state/workspace.svelte";
import {arduino} from "@leaphy-robotics/leaphy-blocks";
import BlocklyState from "$state/blockly.svelte";
import Uploader from "$components/core/popups/popups/Uploader.svelte";
import PopupState from "./popup.svelte";
import AppState from "$state/app.svelte";
import {Sensor} from "@leaphy-robotics/leaphy-blocks/src/categories/ml/sensors";

export const Step = {
	SETUP: Setup as Component,
	COLLECT: Collect as Component,
}

export const steps = [Step.SETUP, Step.COLLECT]

function findMaxIndex(arr: number[]) {
	if (arr.length === 0) return -1; // Handle empty array

	let maxIndex = 0;
	for (let i = 1; i < arr.length; i++) {
		if (arr[i] > arr[maxIndex]) {
			maxIndex = i;
		}
	}
	return maxIndex;
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

class MLState {
	stepIndex = $state(0);
	step = $derived(steps[this.stepIndex]);
	classes = $state<Class[]>([]);
	classCharacteristics = $state<Record<string, BluetoothRemoteGATTCharacteristic>>({});
	learning = $state(false)

	classification: string = null

	frame: (number|null)[] = []
	model: tf.Sequential

	datasets = $state<Dataset[]>([])
	sensors = $state<{ id: string, type: Sensor, settings: unknown }[]>([])
	data: DataFrame[] = []
	dataSplit: number[] = $state([100, 50, 50, 50])

	async setClassification(classification: string) {
		if (this.classification === classification) return
		if (this.classification) {
			await this.classCharacteristics[this.classification].writeValue(new Uint8Array([0]))
		}

		this.classification = classification
		await this.classCharacteristics[this.classification].writeValue(new Uint8Array([1]))
	}

	constructor() {
		document.body.addEventListener("keydown", async (e) => {
			if (!this.learning) return

			const triggered = ml.getClasses().find(classData => classData.key === e.code)
			if (!triggered) return

			await this.setClassification(triggered.id)
		})

		document.body.addEventListener("keyup", async (e) => {
			if (!this.learning) return

			const triggered = ml.getClasses().find(classData => classData.key === e.code)
			if (!triggered || triggered.id !== this.classification) return

			await this.classCharacteristics[this.classification].writeValue(new Uint8Array([0]))
			this.classification = null
		})

		ml.addEventListener('updateSensors', () => this.sensors = ml.getSensors())
	}

	async learn() {
		this.classification = ''
		Object.values(this.classCharacteristics).forEach(characteristic => {
			characteristic.writeValue(new Uint8Array([0]))
		})

		if (this.learning) {
			this.datasets.push(ml.addDataset(this.data))
			this.learning = false
			return
		}

		this.learning = true
	}

	async connect() {
		const device = await navigator.bluetooth.requestDevice({
			filters: [{
				services: ['071bbd8f-5002-440f-b2e5-bee56f630d2b']
			}]
		})

		const gatt = await device.gatt.connect()
		const service = await gatt.getPrimaryService('071bbd8f-5002-440f-b2e5-bee56f630d2b')

		this.classes = ml.getClasses()
		this.datasets = ml.getDatasets()
		this.frame = new Array(this.sensors.length).fill(null)
		for (const classData of this.classes) {
			this.classCharacteristics[classData.id] = await service.getCharacteristic(classData.id)
		}

		for (const i in this.sensors) {
			const sensor = this.sensors[i]
			const characteristic = await service.getCharacteristic(sensor.id)
			await characteristic.startNotifications()

			characteristic.addEventListener('characteristicvaluechanged', async e => {
				this.frame[i] = (e.target as unknown as { value: DataView }).value.getFloat32(0, true)

				for (const item of this.frame) {
					if (item === null) return
				}

				if (this.classification && this.learning) {
					this.data.push({
						input: this.frame as number[],
						detected: this.classification
					})
				}
				if (this.model) {
					const result = this.model.predict(tf.tensor2d(this.frame, [1, this.sensors.length])) as tf.Tensor
					const predictions = Array.from(result.dataSync())

					await this.setClassification(this.classes[findMaxIndex(predictions)].id)
				}

				this.frame = new Array(this.sensors.length).fill(null)
			})
		}

		this.stepIndex++;
	}

	async train() {
		const model = tf.sequential({
			layers: [
				tf.layers.dense({ inputShape: [this.sensors.length], units: 9, activation: 'relu' }),
				tf.layers.dense({ units: 6, activation: 'relu' }),
				tf.layers.dense({ units: this.classes.length, activation: 'softmax' }),
			]
		});
		model.compile({
			optimizer: 'adam',
			loss: 'categoricalCrossentropy',
			metrics: ['accuracy']
		});

		const frames = this.classes
			.flatMap((classData, i) => {
				const frames = ml.getDatasets().flatMap(dataset => dataset.getDataForClass(classData.id))

				return getRandomItems(frames, this.dataSplit[i])
			})
			.map(frame => ({
				...frame,
				output: this.classes.map(classData => classData.id === frame.detected ? 1 : 0)
			}))

		console.log(ml.getDatasets())

		const data = tf.tensor2d(frames.map(frame => frame.input))
		const labels = tf.tensor2d(frames.map(frame => frame.output))

		console.log('training model')
		await model.fit(data, labels, { epochs: 100 })
		console.log('model trained!')

		const res = await model.save("http://localhost:8000/ml/convert")
		ml.modelHeaders = await res.responses[0].json()
		ml.generateInference = true

		const code = arduino.workspaceToCode(
			BlocklyState.workspace,
			WorkspaceState.robot.id,
		);
		AppState.libraries.clear();
		AppState.libraries.install(...arduino.getDependencies());

		console.log(code)
		await PopupState.open({
			component: Uploader,
			data: {
				source: code
			},
			allowInteraction: false,
		});
		ml.generateInference = false

		// this.model = model
	}
}

export default new MLState();
