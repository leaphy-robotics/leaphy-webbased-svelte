/**
 * Machine Learning category for Blockly blocks.
 *
 * This module provides the core data structures and functionality for machine learning
 * features including class management, dataset handling, sensor integration, and model
 * configuration. It manages the complete ML workflow from data collection to model training.
 */

import { dialog } from "blockly";
import { Msg, type WorkspaceSvg } from "blockly/core";
import type { ISerializer } from "blockly/core/interfaces/i_serializer";
import type { FlyoutDefinition } from "blockly/core/utils/toolbox";
import { type Sensor, sensorByType } from "./ml/sensors";

/**
 * Represents a classification class in the ML model.
 * Each class has a unique identifier, display name, and optional keyboard key for data collection.
 */
export class Class {
	constructor(
		public id: string,
		public name: string,
		public key: string | null = null,
	) {}
}

/**
 * Represents a single data frame containing sensor input and classification result.
 */
export interface DataFrame {
	input: number[];
	detected: string;
}

/**
 * Contains a collection of data frames with metadata.
 * Used to store training and testing data for machine learning models.
 */
export class Dataset {
	public date: Date;

	constructor(
		public id: string,
		public data: DataFrame[],
		date = Date.now(),
	) {
		this.date = new Date(date);
	}

	/**
	 * Filters data frames to return only those belonging to a specific class.
	 * @param id The class ID to filter by
	 * @returns Array of data frames for the specified class
	 */
	getDataForClass(id: string) {
		return this.data.filter((data) => data.detected === id);
	}
}

/**
 * Reference to a sensor configuration stored in the ML system.
 * Contains the sensor type and its settings but not the full sensor implementation.
 */
export interface SensorReference {
	id: string;
	type: string;
	settings: unknown;
}

/**
 * Full sensor data including the actual sensor implementation.
 * Used when working with sensors that have been resolved from references.
 */
export interface SensorData {
	id: string;
	type: Sensor;
	settings: unknown;
}

/**
 * Defines a layer in the neural network model structure.
 */
export interface ModelLayer {
	activation: "softmax" | "relu";
	units: number;
}

/**
 * Main ML system class that manages the complete machine learning workflow.
 *
 * This class serves as the central coordinator for:
 * - Sensor configuration and data collection
 * - Classification class management
 * - Dataset storage and retrieval
 * - Model structure configuration
 * - Training progress tracking
 *
 * Extends EventTarget to provide real-time updates to the UI when state changes.
 */
class ML extends EventTarget {
	/** Prevents modifications when set to true (used during loading) */
	public freeze = false;

	/** Registry of configured sensors by ID */
	public sensors: Record<string, SensorReference> = {};
	/** Registry of classification classes by ID */
	public classes: Record<string, Class> = {};
	/** Registry of collected datasets by ID */
	public datasets: Record<string, Dataset> = {};

	/** Unique identifier for the current training session */
	public trainingID: string = crypto.randomUUID();
	/** C++ header code for the trained model (null if not trained) */
	public modelHeaders: string | null = null;
	/** Whether to generate inference code instead of data collection code */
	public generateInference = false;

	private _enabled = false;
	private _maxStep = 0;
	private _confusion: number[][] | null = null;
	private _structure: ModelLayer[] = [
		{ activation: "relu", units: 9 },
		{ activation: "relu", units: 6 },
	];

	/** Gets the current neural network structure */
	get structure() {
		return this._structure;
	}

	/** Sets the neural network structure and notifies listeners */
	set structure(value: ModelLayer[]) {
		this._structure = value;
		this.dispatchEvent(new Event("updateStructure"));
	}

	/** Gets the maximum step reached in the ML workflow */
	get maxStep() {
		return this._maxStep;
	}

	/** Sets the maximum step and notifies listeners */
	set maxStep(maxStep: number) {
		this._maxStep = maxStep;
		this.dispatchEvent(new Event("updateMaxStep"));
	}

	/** Gets whether ML features are enabled */
	get enabled() {
		return this._enabled;
	}

	/** Sets ML enabled state and notifies listeners */
	set enabled(value: boolean) {
		this._enabled = value;
		this.dispatchEvent(new Event("updateEnabled"));
	}

	/** Gets the confusion matrix from model evaluation */
	get confusion() {
		return this._confusion;
	}

	/** Sets the confusion matrix and notifies listeners */
	set confusion(value: number[][] | null) {
		this._confusion = value;
		this.dispatchEvent(new Event("updateConfusion"));
	}

	/**
	 * Adds a sensor to the ML system.
	 * @param sensor The sensor configuration including type and settings
	 * @param id Optional unique identifier (auto-generated if not provided)
	 */
	addSensor(
		sensor: { type: Sensor; settings: unknown },
		id: string = crypto.randomUUID(),
	) {
		this.sensors[id] = {
			id,
			type: sensor.type.type,
			settings: sensor.settings,
		};
		this.dispatchEvent(new Event("updateSensors"));
	}

	/**
	 * Removes a sensor from the ML system.
	 * @param id The sensor ID to remove
	 */
	deleteSensor(id: string) {
		delete this.sensors[id];
		this.dispatchEvent(new Event("updateSensors"));
	}

	/**
	 * Retrieves a sensor with its full implementation.
	 * @param id The sensor ID to retrieve
	 * @returns Sensor data with resolved type implementation
	 */
	getSensor(id: string) {
		const sensor = this.sensors[id];

		return {
			...sensor,
			type: sensorByType[sensor.type],
		};
	}

	/**
	 * Gets all sensors with their full implementations.
	 * @returns Array of all sensor data with resolved type implementations
	 */
	getSensors() {
		return Object.values(this.sensors).map((sensor) => ({
			...sensor,
			type: sensorByType[sensor.type],
		}));
	}

	/**
	 * Adds a classification class to the ML system.
	 * @param name Display name for the class
	 * @param id Optional unique identifier (auto-generated if not provided)
	 * @param key Optional keyboard key for data collection
	 */
	addClass(
		name: string,
		id: string = crypto.randomUUID(),
		key: string | null = null,
	) {
		this.classes[id] = new Class(id, name, key);
		this.dispatchEvent(new Event("updateClasses"));
	}

	/**
	 * Retrieves a specific class by ID.
	 * @param id The class ID to retrieve
	 * @returns The class object
	 */
	getClass(id: string): Class {
		return this.classes[id];
	}

	/**
	 * Gets all classification classes.
	 * @returns Array of all class objects
	 */
	getClasses() {
		return Object.values(this.classes);
	}

	/**
	 * Gets the index position of a class in the classes array.
	 * @param id The class ID to find
	 * @returns The zero-based index of the class
	 */
	getClassIndex(id: string) {
		return this.getClasses().indexOf(this.getClass(id));
	}

	/**
	 * Adds a dataset to the ML system.
	 * @param data Array of data frames containing sensor inputs and classifications
	 * @param id Optional unique identifier (auto-generated if not provided)
	 * @param date Optional timestamp (defaults to current time)
	 * @returns The created dataset object
	 */
	addDataset(
		data: DataFrame[],
		id: string = crypto.randomUUID(),
		date = Date.now(),
	) {
		const dataset = new Dataset(id, data, date);
		this.datasets[id] = dataset;
		this.dispatchEvent(new Event("updateDatasets"));

		return dataset;
	}

	/**
	 * Removes a dataset from the ML system.
	 * @param id The dataset ID to remove
	 */
	deleteDataset(id: string) {
		delete this.datasets[id];
		this.dispatchEvent(new Event("updateDatasets"));
	}

	/**
	 * Clears all datasets and resets training state.
	 * This also clears model headers, confusion matrix, and resets max step.
	 */
	clearDatasets() {
		this.datasets = {};
		this.modelHeaders = null;
		this.confusion = null;
		this.maxStep = 0;

		this.dispatchEvent(new Event("updateDatasets"));
		this.dispatchEvent(new Event("updateConfusion"));
		this.dispatchEvent(new Event("updateMaxStep"));
	}

	/**
	 * Retrieves a specific dataset by ID.
	 * @param id The dataset ID to retrieve
	 * @returns The dataset object
	 */
	getDataset(id: string) {
		return this.datasets[id];
	}

	/**
	 * Gets all datasets.
	 * @returns Array of all dataset objects
	 */
	getDatasets() {
		return Object.values(this.datasets);
	}

	/**
	 * Resets the entire ML system to its initial state.
	 * Clears all sensors, classes, datasets, and resets configuration.
	 */
	clear() {
		this.structure = [
			{ activation: "relu", units: 9 },
			{ activation: "relu", units: 6 },
		];

		this.classes = {};
		this.dispatchEvent(new Event("updateClasses"));

		this.datasets = {};
		this.dispatchEvent(new Event("updateDatasets"));

		this.sensors = {};
		this.dispatchEvent(new Event("updateSensors"));

		this.maxStep = 0;
		this.enabled = false;
	}
}

/** Global ML system instance */
export const ml = new ML();

/** Serializable representation of a classification class */
interface SerialClass {
	id: string;
	name: string;
	key: string | null;
}

/** Serializable representation of a dataset */
interface SerialDataset {
	id: string;
	date: number;
	data: DataFrame[];
}

/** Complete ML state for serialization */
interface MLState {
	structure: ModelLayer[];
	maxStep: number;
	trainingID: string;
	confusion: number[][] | null;
	enabled: boolean;
	classes: SerialClass[];
	datasets: SerialDataset[];
	sensors: SensorReference[];
	modelHeaders: string | null;
}

/**
 * Handles serialization and deserialization of ML state for workspace saving/loading.
 * Implements Blockly's ISerializer interface to integrate with the workspace persistence system.
 */
export class MLSerializer implements ISerializer {
	public priority = 90;

	/**
	 * Clears the ML system when the workspace is cleared.
	 * Respects the freeze flag to prevent clearing during loading operations.
	 */
	clear() {
		if (ml.freeze) return;

		ml.clear();
	}

	/**
	 * Loads ML state from serialized data.
	 * @param state The serialized ML state to load
	 */
	load(state: MLState) {
		if (ml.freeze) return;

		ml.structure = state.structure || ml.structure;
		ml.enabled = state.enabled;
		ml.modelHeaders = state.modelHeaders || null;
		ml.trainingID = state.trainingID || crypto.randomUUID();
		ml.maxStep = state.maxStep || 0;
		ml.confusion = state.confusion || null;

		for (const classState of state.classes) {
			ml.addClass(classState.name, classState.id, classState.key);
		}
		for (const dataset of state.datasets) {
			ml.addDataset(dataset.data, dataset.id, dataset.date);
		}
		for (const sensor of state.sensors) {
			ml.addSensor(
				{ type: sensorByType[sensor.type], settings: sensor.settings },
				sensor.id,
			);
		}
	}

	/**
	 * Saves the current ML state to serializable format.
	 * @returns The serialized ML state or null if nothing to save
	 */
	save(): MLState | null {
		const classes: SerialClass[] = [];
		for (const classState of ml.getClasses()) {
			classes.push({
				id: classState.id,
				name: classState.name,
				key: classState.key,
			});
		}

		const datasets: SerialDataset[] = [];
		for (const dataset of ml.getDatasets()) {
			datasets.push({
				id: dataset.id,
				data: dataset.data,
				date: dataset.date.getTime(),
			});
		}

		const sensors: SensorReference[] = [];
		for (const [id, sensor] of Object.entries(ml.sensors)) {
			sensors.push({
				id,
				type: sensor.type,
				settings: sensor.settings,
			});
		}

		return {
			classes,
			datasets,
			sensors,
			enabled: ml.enabled,
			modelHeaders: ml.modelHeaders,
			trainingID: ml.trainingID,
			maxStep: ml.maxStep,
			confusion: ml.confusion,
			structure: ml.structure,
		};
	}
}

/**
 * Creates the ML category toolbox for the Blockly workspace.
 *
 * Generates dynamic toolbox content based on current ML state including:
 * - Enable/disable ML toggle button
 * - Add class button when ML is enabled
 * - Classification and certainty blocks when classes exist
 *
 * @param workspace The Blockly workspace to register callbacks with
 * @returns Array defining the flyout content for the ML category
 */
export default function (workspace: WorkspaceSvg) {
	let blockList: FlyoutDefinition = [
		{
			kind: "button",
			text: ml.enabled ? "%{BKY_ML_DISABLE}" : "%{BKY_ML_ENABLE}",
			callbackkey: "toggle_ml",
		},
	];

	if (ml.enabled) {
		blockList.push(
			{ kind: "sep", gap: 8 },
			{
				kind: "button",
				text: "%{BKY_ML_ADD_CLASS}",
				callbackkey: "add_class",
			},
		);

		if (ml.getClasses().length > 0) {
			blockList.push(
				{
					kind: "block",
					type: "ml_classify",
				},
				{ kind: "sep", gap: 8 },
				{
					kind: "block",
					type: "ml_certainty",
				},
			);
		}
	}

	// Register callback for toggling ML functionality
	workspace.registerButtonCallback("toggle_ml", () => {
		ml.enabled = !ml.enabled;
		workspace.refreshToolboxSelection();
	});

	// Register callback for adding new classification classes
	workspace.registerButtonCallback("add_class", async () => {
		if (ml.getDatasets().length) {
			const confirmed = await new Promise<boolean>((resolve) =>
				dialog.confirm(Msg.CONFIRM_CLEAR, (result) => resolve(result)),
			);
			if (!confirmed) return;
		}

		ml.clearDatasets();

		dialog.prompt(Msg.NEW_CLASS, "", (name) => {
			if (!name) return;

			ml.addClass(name);
			workspace.refreshToolboxSelection();
		});
	});

	return blockList;
}
