import {ISerializer} from "blockly/core/interfaces/i_serializer";
import {listManager} from "./lists";
import {Variables, WorkspaceSvg} from "blockly/core";
import type {FlyoutDefinition} from "blockly/core/utils/toolbox";

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

class ML {
	public classes: Record<string, Class> = {}
	public datasets: Record<string, Dataset> = {}
	public enabled: boolean = false;

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
}

export class MLSerializer implements ISerializer {
	public priority = 90;

	clear() {
		ml.clear();
	}

	load(state: MLState) {
		ml.enabled = state.enabled;

		for (const classState of state.classes) {
			ml.addClass(classState.name, classState.id, classState.key);
		}
		for (const dataset of state.datasets) {
			ml.addDataset(dataset.data, dataset.id, dataset.date)
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

		return { classes, datasets, enabled: ml.enabled };
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
					inputs: {
						CERTAINTY: {
							shadow: {
								type: "math_number",
								fields: {
									NUM: 80,
								},
							},
						}
					}
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
