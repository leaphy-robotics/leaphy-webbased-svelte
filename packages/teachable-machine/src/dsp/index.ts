import * as tf from "@tensorflow/tfjs";

export const NUM_FRAMES = 49;
export const NUM_MEL = 40;
export const FEATURE_SIZE = NUM_FRAMES * NUM_MEL;
export const EMBEDDING_DIM = 3 * NUM_MEL;
export const LOG_OFFSET = 1e-6;
export const NORM_EPS = 1e-6;

function readTensor(operation: () => tf.Tensor): Float32Array {
	let values: Float32Array | undefined;
	tf.tidy(() => {
		values = Float32Array.from(operation().dataSync());
	});
	return values ?? new Float32Array();
}

export function normalizeFeatures(features: Float32Array): Float32Array {
	if (features.length !== FEATURE_SIZE) {
		throw new Error(
			`expected ${FEATURE_SIZE} features, got ${features.length}`,
		);
	}
	return readTensor(() => {
		const tensor = tf.tensor1d(features);
		const { mean, variance } = tf.moments(tensor);
		return tensor.sub(mean).div(variance.sqrt().add(NORM_EPS));
	});
}

export function embed(features: Float32Array): Float32Array {
	if (features.length !== FEATURE_SIZE) {
		throw new Error(
			`expected ${FEATURE_SIZE} features, got ${features.length}`,
		);
	}
	return readTensor(() => {
		const frames = tf.tensor2d(features, [NUM_FRAMES, NUM_MEL]);
		const { mean, variance } = tf.moments(frames, 0);
		const deltas = frames
			.slice([1, 0])
			.sub(frames.slice([0, 0], [NUM_FRAMES - 1, NUM_MEL]))
			.mean(0);
		return tf.concat([mean, variance.sqrt(), deltas]);
	});
}
