export interface TrainingSample {
	/** Integer class index in [0, numClasses). */
	label: number;
	/** Frozen 120-value embedding, preferably computed on the Nano. */
	embedding: Float32Array;
	/** Raw unnormalized 49x40 log-mel matrix, when augmentation is desired. */
	logMel?: Float32Array;
	/** Marks the mandatory background-noise class. */
	isBackground?: boolean;
}

export interface TrainedHead {
	/** Row-major [numClasses][120], matching the Arduino library. */
	weights: Float32Array;
	bias: Float32Array;
	finalAccuracy: number;
	realSamples: number;
	generatedSamples: number;
}
