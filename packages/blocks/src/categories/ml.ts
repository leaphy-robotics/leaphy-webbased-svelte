import {ISerializer} from "blockly/core/interfaces/i_serializer";
import {Variables, WorkspaceSvg} from "blockly/core";
import type {FlyoutDefinition} from "blockly/core/utils/toolbox";
import {Sensor, sensorByType} from "./ml/sensors";

export class Class {
	constructor(
		public id: string,
		public name: string,
		public key: string|null = null
	) {}
}

export interface DataFrame {
	input: number[],
	detected: string
}

export class Dataset {
	public date: Date

	constructor(
		public id: string,
		public data: DataFrame[],
		date = Date.now(),
	) {
		this.date = new Date(date)
	}

	getDataForClass(id: string) {
		return this.data.filter(data => data.detected === id)
	}
}

export interface SensorReference {
	id: string
	type: string
	settings: unknown
}

export interface SensorData {
	id: string
	type: Sensor
	settings: unknown
}

class ML extends EventTarget {
	public sensors: Record<string, SensorReference> = {}
	public classes: Record<string, Class> = {}
	public datasets: Record<string, Dataset> = {}
	public enabled: boolean = false;

	public modelHeaders: string|null = null;
	public generateInference: boolean = false;

	addSensor(sensor: { type: Sensor, settings: unknown }, id: string = crypto.randomUUID()) {
		this.sensors[id] = {
			id,
			type: sensor.type.type,
			settings: sensor.settings,
		}
		this.dispatchEvent(new Event('updateSensors'))
	}

	deleteSensor(id: string) {
		delete this.sensors[id];
		this.dispatchEvent(new Event('updateSensors'))
	}

	getSensor(id: string) {
		const sensor = this.sensors[id];

		return {
			...sensor,
			type: sensorByType[sensor.type]
		}
	}

	getSensors() {
		return Object.values(this.sensors).map(sensor => ({
			...sensor,
			type: sensorByType[sensor.type],
		}));
	}

	addClass(name: string, id: string = crypto.randomUUID(), key: string|null = null) {
		this.classes[id] = new Class(id, name, key)
	}

	getClass(id: string): Class {
		return this.classes[id]
	}

	getClasses() {
		return Object.values(this.classes)
	}

	addDataset(data: DataFrame[], id: string = crypto.randomUUID(), date = Date.now()) {
		const dataset = new Dataset(id, data, date)
		this.datasets[id] = dataset

		return dataset
	}

	getDataset(id: string) {
		return this.datasets[id]
	}

	getDatasets() {
		return Object.values(this.datasets)
	}

	clear() {
		this.classes = {}
		this.datasets = {}
		this.sensors = {}
	}
}

export const ml = new ML()

interface SerialClass {
	id: string
	name: string
	key: string|null
}

interface SerialDataset {
	id: string
	date: number
	data: DataFrame[]
}

interface MLState {
	enabled: boolean,
	classes: SerialClass[],
	datasets: SerialDataset[],
	sensors: SensorReference[],
	modelHeaders: string|null
}

export class MLSerializer implements ISerializer {
	public priority = 90;

	clear() {
		ml.clear();
	}

	load(state: MLState) {
		ml.enabled = state.enabled;
		ml.modelHeaders = state.modelHeaders || null;

		for (const classState of state.classes) {
			ml.addClass(classState.name, classState.id, classState.key);
		}
		for (const dataset of state.datasets) {
			ml.addDataset(dataset.data, dataset.id, dataset.date)
		}
		for (const sensor of state.sensors) {
			ml.addSensor({ type: sensorByType[sensor.type], settings: sensor.settings }, sensor.id)
		}
	}

	save(): MLState | null {
		const classes: SerialClass[] = [];
		for (const classState of ml.getClasses()) {
			classes.push({
				id: classState.id,
				name: classState.name,
				key: classState.key,
			});
		}

		const datasets: SerialDataset[] = []
		for (const dataset of ml.getDatasets()) {
			datasets.push({
				id: dataset.id,
				data: dataset.data,
				date: dataset.date.getTime()
			})
		}

		const sensors: SensorReference[] = []
		for (const [id, sensor] of Object.entries(ml.sensors)) {
			sensors.push({
				id, type: sensor.type, settings: sensor.settings,
			})
		}

		return { classes, datasets, sensors, enabled: ml.enabled, modelHeaders: ml.modelHeaders };
	}
}

export default function (workspace: WorkspaceSvg) {
	let blockList: FlyoutDefinition = [
		{
			kind: "button",
			text: ml.enabled ? "Disable machine learning" : "Enable machine learning",
			callbackkey: "toggle_ml"
		},
	];

	if (ml.enabled) {
		blockList.push(
			{ kind: "sep", gap: 8 },
			{
				kind: "button",
				text: "Add class",
				callbackkey: "add_class",
			}
		)

		if (ml.getClasses().length > 0) {
			blockList.push(
				{
					kind: "block",
					type: "ml_classify"
				},
				{ kind: "sep", gap: 8 },
				{
					kind: "block",
					type: "ml_certainty",
				}
			)
		}
	}

	workspace.registerButtonCallback("toggle_ml", () => {
		ml.enabled = !ml.enabled;
		workspace.refreshToolboxSelection();
	});
	workspace.registerButtonCallback("add_class", () => {
		Variables.promptName("add_class", "", (name) => {
			if (!name) return;

			ml.addClass(name);
			workspace.refreshToolboxSelection();
		});
	});

	return blockList;
}
