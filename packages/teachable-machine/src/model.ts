import * as tf from "@tensorflow/tfjs";
import { EMBEDDING_DIM } from "./dsp";
import type { TrainedHead } from "./types";

export function createClassifier(numClasses: number, l2 = 0): tf.Sequential {
	return tf.sequential({
		layers: [
			tf.layers.dense({
				inputShape: [EMBEDDING_DIM],
				units: numClasses,
				activation: "softmax",
				kernelRegularizer: l2 ? tf.regularizers.l2({ l2 }) : undefined,
			}),
		],
	});
}

export class TrainedAudioModel implements TrainedHead {
	readonly weights: Float32Array;
	readonly bias: Float32Array;
	readonly finalAccuracy: number;
	readonly realSamples: number;
	readonly generatedSamples: number;

	constructor(
		readonly network: tf.Sequential,
		head: TrainedHead,
	) {
		this.weights = head.weights;
		this.bias = head.bias;
		this.finalAccuracy = head.finalAccuracy;
		this.realSamples = head.realSamples;
		this.generatedSamples = head.generatedSamples;
	}

	static fromWeights(head: TrainedHead): TrainedAudioModel {
		const numClasses = head.bias.length;
		const network = createClassifier(numClasses);
		tf.tidy(() => {
			const kernel = tf
				.tensor2d(head.weights, [numClasses, EMBEDDING_DIM])
				.transpose();
			network.setWeights([kernel, tf.tensor1d(head.bias)]);
		});
		return new TrainedAudioModel(network, head);
	}

	predict(embedding: Float32Array): Float32Array {
		if (embedding.length !== EMBEDDING_DIM) {
			throw new Error(`expected ${EMBEDDING_DIM}-value embedding`);
		}
		let probabilities: Float32Array | undefined;
		tf.tidy(() => {
			const input = tf.tensor2d(embedding, [1, EMBEDDING_DIM]);
			const output = this.network.predict(input) as tf.Tensor;
			probabilities = Float32Array.from(output.dataSync());
		});
		return probabilities ?? new Float32Array();
	}

	dispose(): void {
		this.network.dispose();
	}
}
