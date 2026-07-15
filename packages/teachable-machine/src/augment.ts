import {
	embed,
	FEATURE_SIZE,
	LOG_OFFSET,
	NUM_FRAMES,
	NUM_MEL,
	normalizeFeatures,
} from "./dsp";
import type { TrainingSample } from "./types";

export interface AugmentationOptions {
	variationsPerSample?: number;
	noiseLayering?: boolean;
	seed?: number;
}

export interface AugmentedDataset {
	embeddings: Float32Array[];
	labels: number[];
	generated: number;
}

const DEFAULT_SEED = 0x51a7c0de;
const MAX_VARIATIONS = 12;

function mulberry32(seed: number): () => number {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

function shiftLogMel(
	logMel: Float32Array,
	timeShift: number,
	melShift: number,
): Float32Array {
	const shifted = new Float32Array(FEATURE_SIZE);
	let floor = Infinity;
	for (const value of logMel) if (value < floor) floor = value;

	for (let frameIndex = 0; frameIndex < NUM_FRAMES; frameIndex++) {
		const sourceFrame = (frameIndex - timeShift + NUM_FRAMES) % NUM_FRAMES;
		for (let filterIndex = 0; filterIndex < NUM_MEL; filterIndex++) {
			const sourceFilter = filterIndex - melShift;
			shifted[frameIndex * NUM_MEL + filterIndex] =
				sourceFilter < 0 || sourceFilter >= NUM_MEL
					? floor
					: logMel[sourceFrame * NUM_MEL + sourceFilter];
		}
	}
	return shifted;
}

function energy(logValue: number): number {
	return Math.max(0, Math.exp(Math.min(30, logValue)) - LOG_OFFSET);
}

/** Adds two log-mel matrices in mel-energy space at a target SNR. */
export function layerNoise(
	signal: Float32Array,
	noise: Float32Array,
	snrDb: number,
): Float32Array {
	if (signal.length !== FEATURE_SIZE || noise.length !== FEATURE_SIZE) {
		throw new Error(`expected two ${FEATURE_SIZE}-value log-mel matrices`);
	}
	let signalPower = 0;
	let noisePower = 0;
	for (let featureIndex = 0; featureIndex < FEATURE_SIZE; featureIndex++) {
		signalPower += energy(signal[featureIndex]);
		noisePower += energy(noise[featureIndex]);
	}
	const noiseScale =
		noisePower > 0 ? signalPower / noisePower / 10 ** (snrDb / 10) : 0;
	const mixed = new Float32Array(FEATURE_SIZE);
	for (let featureIndex = 0; featureIndex < FEATURE_SIZE; featureIndex++) {
		mixed[featureIndex] = Math.log(
			energy(signal[featureIndex]) +
				noiseScale * energy(noise[featureIndex]) +
				LOG_OFFSET,
		);
	}
	return mixed;
}

function applyMask(features: Float32Array, random: () => number): void {
	if (random() < 0.7) {
		const width = 1 + Math.floor(random() * 4);
		const start = Math.floor(random() * (NUM_FRAMES - width + 1));
		for (let frameIndex = start; frameIndex < start + width; frameIndex++) {
			features.fill(0, frameIndex * NUM_MEL, (frameIndex + 1) * NUM_MEL);
		}
	}
	if (random() < 0.5) {
		const width = 1 + Math.floor(random() * 3);
		const start = Math.floor(random() * (NUM_MEL - width + 1));
		for (let frameIndex = 0; frameIndex < NUM_FRAMES; frameIndex++) {
			features.fill(
				0,
				frameIndex * NUM_MEL + start,
				frameIndex * NUM_MEL + start + width,
			);
		}
	}
}

function variationCount(value = 0): number {
	return Math.max(0, Math.min(MAX_VARIATIONS, Math.round(value)));
}

export function buildAugmentedDataset(
	samples: TrainingSample[],
	options: AugmentationOptions = {},
): AugmentedDataset {
	const embeddings: Float32Array[] = [];
	const labels: number[] = [];
	const random = mulberry32(options.seed ?? DEFAULT_SEED);
	const backgrounds = samples.flatMap(({ isBackground, logMel }) =>
		isBackground && logMel ? [logMel] : [],
	);
	const variationsPerSample = variationCount(options.variationsPerSample);

	for (const sample of samples) {
		embeddings.push(sample.embedding);
		labels.push(sample.label);
		if (!sample.logMel) continue;

		for (
			let variationIndex = 0;
			variationIndex < variationsPerSample;
			variationIndex++
		) {
			let augmented = shiftLogMel(
				sample.logMel,
				Math.floor(random() * 7) - 3,
				Math.floor(random() * 3) - 1,
			);
			if (options.noiseLayering !== false && backgrounds.length) {
				const noise = backgrounds[Math.floor(random() * backgrounds.length)];
				const signalToNoiseRatio = sample.isBackground
					? random() * 6
					: 8 + random() * 14;
				augmented = layerNoise(augmented, noise, signalToNoiseRatio);
			}
			augmented = normalizeFeatures(augmented);
			applyMask(augmented, random);
			embeddings.push(embed(augmented));
			labels.push(sample.label);
		}
	}

	return {
		embeddings,
		labels,
		generated: embeddings.length - samples.length,
	};
}
