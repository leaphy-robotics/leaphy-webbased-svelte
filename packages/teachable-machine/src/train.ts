import * as tf from "@tensorflow/tfjs";
import { type AugmentationOptions, buildAugmentedDataset } from "./augment";
import { EMBEDDING_DIM } from "./dsp";
import type { TrainedHead, TrainingSample } from "./types";

export interface TrainOptions {
	epochs?: number;
	learningRate?: number;
	l2?: number;
	batchSize?: number;
	augmentation?: AugmentationOptions | false;
	onEpoch?: (
		epoch: number,
		epochs: number,
		loss: number,
		accuracy: number,
	) => void | Promise<void>;
}

/** Low-level dense-head trainer for callers that already have embeddings. */
export async function trainHead(
	embeddings: Float32Array[],
	labels: number[],
	numClasses: number,
	options: TrainOptions = {},
): Promise<TrainedHead & { model: tf.Sequential }> {
	const {
		epochs = 100,
		learningRate = 0.05,
		l2 = 1e-4,
		batchSize = 16,
		onEpoch,
	} = options;
	if (!embeddings.length || embeddings.length !== labels.length)
		throw new Error("embeddings/labels mismatch or empty");
	if (labels.some((label) => label < 0 || label >= numClasses))
		throw new Error("label outside numClasses");
	const flat = new Float32Array(embeddings.length * EMBEDDING_DIM);
	embeddings.forEach((embedding, i) => {
		if (embedding.length !== EMBEDDING_DIM)
			throw new Error(`expected ${EMBEDDING_DIM}-value embedding`);
		flat.set(embedding, i * EMBEDDING_DIM);
	});
	const xs = tf.tensor2d(flat, [embeddings.length, EMBEDDING_DIM]);
	const labelTensor = tf.tensor1d(labels, "int32");
	const ys = tf.oneHot(labelTensor, numClasses).toFloat();
	labelTensor.dispose();
	const model = tf.sequential();
	model.add(
		tf.layers.dense({
			inputShape: [EMBEDDING_DIM],
			units: numClasses,
			activation: "softmax",
			kernelRegularizer: tf.regularizers.l2({ l2 }),
		}),
	);
	model.compile({
		optimizer: tf.train.adam(learningRate),
		loss: "categoricalCrossentropy",
		metrics: ["accuracy"],
	});
	let finalAccuracy = 0;
	await model.fit(xs, ys, {
		epochs,
		batchSize,
		shuffle: true,
		verbose: 0,
		callbacks: {
			onEpochEnd: async (epoch, logs) => {
				finalAccuracy = Number(logs?.acc ?? 0);
				await onEpoch?.(
					epoch + 1,
					epochs,
					Number(logs?.loss ?? 0),
					finalAccuracy,
				);
			},
		},
	});
	const [kernelTensor, biasTensor] = model.getWeights();
	const kernel = await kernelTensor.data();
	const bias = Float32Array.from(await biasTensor.data());
	const weights = new Float32Array(numClasses * EMBEDDING_DIM);
	for (let c = 0; c < numClasses; c++)
		for (let d = 0; d < EMBEDDING_DIM; d++) {
			weights[c * EMBEDDING_DIM + d] = kernel[d * numClasses + c];
		}
	xs.dispose();
	ys.dispose();
	return {
		weights,
		bias,
		finalAccuracy,
		realSamples: embeddings.length,
		generatedSamples: 0,
		model,
	};
}

/** Train directly from Nano samples, optionally generating spectrogram variations. */
export async function trainAudioModel(
	samples: TrainingSample[],
	numClasses: number,
	options: TrainOptions = {},
): Promise<TrainedHead> {
	const dataset = buildAugmentedDataset(
		samples,
		options.augmentation === false ? {} : options.augmentation,
	);
	const result = await trainHead(
		dataset.embeddings,
		dataset.labels,
		numClasses,
		options,
	);
	result.model.dispose();
	return {
		weights: result.weights,
		bias: result.bias,
		finalAccuracy: result.finalAccuracy,
		realSamples: samples.length,
		generatedSamples: dataset.generated,
	};
}
