export interface TrainingSample {
	label: number;
	embedding: Float32Array;
	logMel?: Float32Array;
	isBackground?: boolean;
}

export interface TrainedHead {
	weights: Float32Array;
	bias: Float32Array;
	finalAccuracy: number;
	realSamples: number;
	generatedSamples: number;
}
