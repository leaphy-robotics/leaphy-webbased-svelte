import {
	FEATURE_SIZE, LOG_OFFSET, NUM_FRAMES, NUM_MEL, embed, normalizeFeatures,
} from './dsp';
import type { TrainingSample } from './types';

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

function mulberry32(seed: number): () => number {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function shifted(logMel: Float32Array, timeShift: number, melShift: number): Float32Array {
	const out = new Float32Array(FEATURE_SIZE);
	let floor = Infinity;
	for (const value of logMel) if (value < floor) floor = value;
	for (let t = 0; t < NUM_FRAMES; t++) {
		const sourceT = (t - timeShift + NUM_FRAMES) % NUM_FRAMES;
		for (let m = 0; m < NUM_MEL; m++) {
			const sourceM = m - melShift;
			out[t * NUM_MEL + m] = sourceM < 0 || sourceM >= NUM_MEL
				? floor : logMel[sourceT * NUM_MEL + sourceM];
		}
	}
	return out;
}

function energy(logValue: number): number {
	return Math.max(0, Math.exp(Math.min(30, logValue)) - LOG_OFFSET);
}

/** Adds two log-mel matrices in mel-energy space at a target SNR. */
export function layerNoise(signal: Float32Array, noise: Float32Array, snrDb: number): Float32Array {
	if (signal.length !== FEATURE_SIZE || noise.length !== FEATURE_SIZE) {
		throw new Error(`expected two ${FEATURE_SIZE}-value log-mel matrices`);
	}
	let signalPower = 0;
	let noisePower = 0;
	for (let i = 0; i < FEATURE_SIZE; i++) {
		signalPower += energy(signal[i]);
		noisePower += energy(noise[i]);
	}
	const scale = noisePower > 0 ? signalPower / noisePower / Math.pow(10, snrDb / 10) : 0;
	const mixed = new Float32Array(FEATURE_SIZE);
	for (let i = 0; i < FEATURE_SIZE; i++) {
		mixed[i] = Math.log(energy(signal[i]) + scale * energy(noise[i]) + LOG_OFFSET);
	}
	return mixed;
}

function mask(features: Float32Array, random: () => number): void {
	if (random() < 0.7) {
		const width = 1 + Math.floor(random() * 4);
		const start = Math.floor(random() * (NUM_FRAMES - width + 1));
		for (let t = start; t < start + width; t++) features.fill(0, t * NUM_MEL, (t + 1) * NUM_MEL);
	}
	if (random() < 0.5) {
		const width = 1 + Math.floor(random() * 3);
		const start = Math.floor(random() * (NUM_MEL - width + 1));
		for (let t = 0; t < NUM_FRAMES; t++) features.fill(0, t * NUM_MEL + start, t * NUM_MEL + start + width);
	}
}

export function buildAugmentedDataset(
	samples: TrainingSample[],
	options: AugmentationOptions = {}
): AugmentedDataset {
	const embeddings: Float32Array[] = [];
	const labels: number[] = [];
	const random = mulberry32(options.seed ?? 0x51a7c0de);
	const backgrounds = samples.filter((sample) => sample.isBackground && sample.logMel);
	const count = Math.max(0, Math.min(12, Math.round(options.variationsPerSample ?? 0)));
	let generated = 0;
	for (const sample of samples) {
		embeddings.push(sample.embedding);
		labels.push(sample.label);
		if (!sample.logMel) continue;
		for (let variation = 0; variation < count; variation++) {
			let augmented = shifted(sample.logMel, Math.floor(random() * 7) - 3, Math.floor(random() * 3) - 1);
			if (options.noiseLayering !== false && backgrounds.length > 0) {
				const noise = backgrounds[Math.floor(random() * backgrounds.length)].logMel;
				if (noise) augmented = layerNoise(augmented, noise, sample.isBackground ? random() * 6 : 8 + random() * 14);
			}
			normalizeFeatures(augmented);
			mask(augmented, random);
			embeddings.push(embed(augmented));
			labels.push(sample.label);
			generated++;
		}
	}
	return { embeddings, labels, generated };
}
