import * as tf from "@tensorflow/tfjs";
import { type AugmentationOptions, buildAugmentedDataset } from "./augment";
import { EMBEDDING_DIM } from "./dsp";
import { createClassifier, TrainedAudioModel } from "./model";
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

function validateDataset(
	embeddings: Float32Array[],
	labels: number[],
	numClasses: number,
): void {
	if (!embeddings.length || embeddings.length !== labels.length) {
		throw new Error("embeddings/labels mismatch or empty");
	}
	if (embeddings.some(({ length }) => length !== EMBEDDING_DIM)) {
		throw new Error(`expected ${EMBEDDING_DIM}-value embedding`);
	}
	if (labels.some((label) => label < 0 || label >= numClasses)) {
		throw new Error("label outside numClasses");
	}
}

async function exportHead(
	network: tf.Sequential,
	numClasses: number,
): Promise<Pick<TrainedHead, "weights" | "bias">> {
	const [kernel, bias] = network.getWeights();
	const transposedKernel = tf.tidy(() =>
		kernel.transpose().reshape([numClasses * EMBEDDING_DIM]),
	);
	try {
		return {
			weights: Float32Array.from(await transposedKernel.data()),
			bias: Float32Array.from(await bias.data()),
		};
	} finally {
		transposedKernel.dispose();
	}
}

export async function trainAudioModel(
	samples: TrainingSample[],
	numClasses: number,
	options: TrainOptions = {},
): Promise<TrainedAudioModel> {
	const dataset = buildAugmentedDataset(
		samples,
		options.augmentation === false ? {} : options.augmentation,
	);
	validateDataset(dataset.embeddings, dataset.labels, numClasses);

	const inputs = tf.tensor2d(
		dataset.embeddings.map((embedding) => [...embedding]),
		[dataset.embeddings.length, EMBEDDING_DIM],
	);
	const targets = tf.tidy(() =>
		tf.oneHot(tf.tensor1d(dataset.labels, "int32"), numClasses),
	);
	const network = createClassifier(numClasses, options.l2 ?? 1e-4);
	network.compile({
		optimizer: tf.train.adam(options.learningRate ?? 0.05),
		loss: "categoricalCrossentropy",
		metrics: ["accuracy"],
	});
	const epochs = options.epochs ?? 100;
	let finalAccuracy = 0;

	try {
		await network.fit(inputs, targets, {
			epochs,
			batchSize: options.batchSize ?? 16,
			shuffle: true,
			verbose: 0,
			callbacks: {
				onEpochEnd: async (completedEpoch, logs) => {
					finalAccuracy = Number(logs?.acc ?? 0);
					await options.onEpoch?.(
						completedEpoch + 1,
						epochs,
						Number(logs?.loss ?? 0),
						finalAccuracy,
					);
				},
			},
		});
		return new TrainedAudioModel(network, {
			...(await exportHead(network, numClasses)),
			finalAccuracy,
			realSamples: samples.length,
			generatedSamples: dataset.generated,
		});
	} catch (error) {
		network.dispose();
		throw error;
	} finally {
		inputs.dispose();
		targets.dispose();
	}
}
