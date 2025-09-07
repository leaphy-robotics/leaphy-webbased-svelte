import type { ML } from "../ml";
import { type Sensor, sensorByType } from "./sensors";

export interface SensorReference {
	id: string;
	type: string;
	settings: unknown;
}

export class SensorManager {
	public sensors: Record<string, SensorReference> = {};

	constructor(private ml: ML) {}

	getItem(id: string) {
		const sensor = this.sensors[id];

		return {
			...sensor,
			type: sensorByType[sensor.type],
		};
	}

	getItems() {
		return Object.values(this.sensors).map((sensor) => ({
			...sensor,
			type: sensorByType[sensor.type],
		}));
	}

	createItem(
		sensor: { type: Sensor; settings: unknown },
		id: string = crypto.randomUUID(),
	) {
		this.sensors[id] = {
			id,
			type: sensor.type.type,
			settings: sensor.settings,
		};
		this.ml.dispatchEvent(new Event("updateSensors"));
	}

	deleteItem(id: string) {
		delete this.sensors[id];
		this.ml.dispatchEvent(new Event("updateSensors"));
	}

	clear() {
		this.sensors = {};
		this.ml.dispatchEvent(new Event("updateSensors"));
	}
}
