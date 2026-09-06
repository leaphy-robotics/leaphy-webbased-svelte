import { describe, expect, it } from "vitest";
import { buildAugmentedDataset, layerNoise } from "../src/augment";
import {
	EMBEDDING_DIM,
	embed,
	FEATURE_SIZE,
	normalizeFeatures,
} from "../src/dsp";
import { TrainedAudioModel } from "../src/model";
import { classColors, generateModelHeader } from "../src/model-header";
import { parseTrainerLine } from "../src/protocol";
import { spectrogramIntensity } from "../src/spectrogram";
import { trainAudioModel } from "../src/train";
import type { TrainingSample } from "../src/types";

describe("trainer protocol", () => {
	it.each([
		["READY", { type: "ready" }],
		["TEACHABLE_AUDIO_TRAINER 4", { type: "hello", version: 4 }],
		["PREPARING 3 2500", { type: "preparing", total: 3, delayMs: 2500 }],
		["RECORDING_BATCH 3", { type: "recordingBatch", total: 3 }],
		["CAPTURED 2", { type: "captured", total: 2 }],
		["DONE 3", { type: "done", total: 3 }],
		["ERROR failed", { type: "error", message: "failed" }],
	])("parses %s", (line, expected) => {
		expect(parseTrainerLine(line)).toEqual(expected);
	});

	it("parses sample vectors", () => {
		const embedding = Array.from(
			{ length: EMBEDDING_DIM },
			(_, dimension) => dimension / 10,
		);
		const message = parseTrainerLine(`FEATURE 2 4 ${embedding.join(",")}`);

		expect(message.type).toBe("feature");
		if (message.type !== "feature") return;
		expect(message.sample).toBe(2);
		expect(message.total).toBe(4);
		expect(message.embedding).toEqual(Float32Array.from(embedding));
	});

	it("reports malformed vectors and unknown messages", () => {
		expect(parseTrainerLine("LIVE_FEATURE 1,NaN")).toEqual({
			type: "error",
			message: `invalid live feature vector (2/${EMBEDDING_DIM} values)`,
		});
		expect(parseTrainerLine("something else")).toEqual({
			type: "unknown",
			line: "something else",
		});
	});
});

describe("augmentation", () => {
	const logMel = Float32Array.from({ length: FEATURE_SIZE }, (_, index) =>
		Math.log((index % 40) + 1),
	);
	const samples: TrainingSample[] = [
		{ label: 0, embedding: new Float32Array(EMBEDDING_DIM), logMel },
		{
			label: 1,
			embedding: new Float32Array(EMBEDDING_DIM).fill(1),
			logMel,
			isBackground: true,
		},
	];

	it("keeps original embeddings and creates deterministic variations", () => {
		const options = {
			variationsPerSample: 2,
			seed: 42,
		};
		const first = buildAugmentedDataset(samples, options);
		const second = buildAugmentedDataset(samples, options);

		expect(first.generated).toBe(4);
		expect(first.labels).toEqual([0, 0, 0, 1, 1, 1]);
		expect(first.embeddings[0]).toBe(samples[0].embedding);
		expect(first.embeddings[3]).toBe(samples[1].embedding);
		expect(first.embeddings).toEqual(second.embeddings);
	});

	it("validates noise matrix sizes", () => {
		expect(() =>
			layerNoise(new Float32Array(1), new Float32Array(FEATURE_SIZE), 10),
		).toThrow(`expected two ${FEATURE_SIZE}-value log-mel matrices`);
	});
});

describe("feature embedding", () => {
	it("normalizes and embeds a spectrogram with TensorFlow", () => {
		const features = Float32Array.from(
			{ length: FEATURE_SIZE },
			(_, index) => index % 17,
		);
		const normalized = normalizeFeatures(features);
		const embedding = embed(normalized);

		const mean =
			normalized.reduce((sum, value) => sum + value, 0) / FEATURE_SIZE;
		expect(mean).toBeCloseTo(0, 5);
		expect(embedding).toHaveLength(EMBEDDING_DIM);
		expect([...embedding].every(Number.isFinite)).toBe(true);
	});
});

describe("model export", () => {
	it("assigns black to the background and cycles class colors", () => {
		const colors = classColors(10, 2);
		expect(colors[2]).toEqual([0, 0, 0]);
		expect(colors[0]).toEqual(colors[9]);
	});

	it("renders model metadata and weights", () => {
		const header = generateModelHeader(
			{
				weights: new Float32Array(2 * EMBEDDING_DIM).fill(0.25),
				bias: Float32Array.from([0.1, -0.1]),
			},
			{
				classNames: ['say "yes"', "background"],
				backgroundIndex: 1,
			},
		);

		expect(header).toContain("#define NUM_CLASSES 2");
		expect(header).toContain("#define BACKGROUND_CLASS_INDEX 1");
		expect(header).toContain('say \\"yes\\"');
		expect(header).toContain(
			`static const float HEAD_WEIGHTS[NUM_CLASSES][${EMBEDDING_DIM}]`,
		);
	});
});

describe("training", () => {
	it("retains the TensorFlow model for prediction and restoration", async () => {
		const embeddings = [
			new Float32Array(EMBEDDING_DIM).fill(-1),
			new Float32Array(EMBEDDING_DIM).fill(-0.5),
			new Float32Array(EMBEDDING_DIM).fill(0.5),
			new Float32Array(EMBEDDING_DIM).fill(1),
		];
		const epochs: number[] = [];
		const samples = embeddings.map((embedding, index) => ({
			embedding,
			label: index < 2 ? 0 : 1,
		}));
		const model = await trainAudioModel(samples, 2, {
			epochs: 2,
			batchSize: 2,
			augmentation: false,
			onEpoch: (epoch) => {
				epochs.push(epoch);
			},
		});
		const restored = TrainedAudioModel.fromWeights(model);
		const prediction = model.predict(embeddings[0]);

		expect(model.weights).toHaveLength(2 * EMBEDDING_DIM);
		expect(model.bias).toHaveLength(2);
		expect(model.realSamples).toBe(4);
		expect(model.generatedSamples).toBe(0);
		expect(epochs).toEqual([1, 2]);
		expect(prediction).toHaveLength(2);
		expect(restored.predict(embeddings[0])).toEqual(prediction);
		model.dispose();
		restored.dispose();
	});
});

describe("spectrogram intensity", () => {
	it("handles empty, constant, and non-finite input", () => {
		expect(spectrogramIntensity(new Float32Array())).toEqual(
			new Float32Array(),
		);
		expect(spectrogramIntensity(new Float32Array(3).fill(2))).toEqual(
			new Float32Array(3).fill(0.5),
		);
		expect(spectrogramIntensity(Float32Array.from([NaN, Infinity]))).toEqual(
			new Float32Array(2).fill(0.5),
		);
	});

	it("scales values using percentile bounds", () => {
		const intensity = spectrogramIntensity(
			Float32Array.from({ length: 100 }, (_, index) => index),
		);
		expect(intensity[1]).toBe(0);
		expect(intensity[98]).toBe(1);
	});
});
