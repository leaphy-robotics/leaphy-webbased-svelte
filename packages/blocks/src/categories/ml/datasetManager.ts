import type {ML} from "../ml";

export interface DataFrame {
	input: number[];
	detected: string;
}

export class Dataset {
	public date: Date;

	constructor(
		public id: string,
		public data: DataFrame[],
		date = Date.now(),
	) {
		this.date = new Date(date);
	}

	getDataForClass(id: string) {
		return this.data.filter((data) => data.detected === id);
	}
}

export class DatasetManager {
	public datasets: Record<string, Dataset> = {};

	constructor(private ml: ML) {}

	getItem(id: string) {
		return this.datasets[id];
	}

	getItems() {
		return Object.values(this.datasets);
	}

	createItem(
		data: DataFrame[],
		id: string = crypto.randomUUID(),
		date = Date.now(),
	) {
		const dataset = new Dataset(id, data, date);
		this.datasets[id] = dataset;
		this.ml.dispatchEvent(new Event("updateDatasets"));

		return dataset;
	}

	deleteItem(id: string) {
		delete this.datasets[id];
		this.ml.dispatchEvent(new Event("updateDatasets"));
	}

	// Cascading clear that resets training state and notifies all affected listeners
	clear() {
		this.datasets = {};
		this.ml.modelHeaders = null;
		this.ml.confusion = null;
		this.ml.maxStep = 0;
	}
}
