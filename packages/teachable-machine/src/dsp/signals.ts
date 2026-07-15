/**
 * Deterministic 1-second test signals used for golden vectors and tests.
 * All signals are generated in double and stored as float32, so every
 * consumer (TS tests, golden generator, C harness input files) sees the
 * exact same bytes.
 */

import { CLIP_SAMPLES, SAMPLE_RATE } from './index';

/** mulberry32 — tiny deterministic PRNG, uniform in [0, 1). */
export function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function silence(): Float32Array {
	return new Float32Array(CLIP_SAMPLES);
}

export function sine(freqHz: number, amplitude = 0.5): Float32Array {
	const out = new Float32Array(CLIP_SAMPLES);
	for (let i = 0; i < CLIP_SAMPLES; i++) {
		out[i] = amplitude * Math.sin((2 * Math.PI * freqHz * i) / SAMPLE_RATE);
	}
	return out;
}

export function whiteNoise(seed = 1234, amplitude = 0.5): Float32Array {
	const rng = mulberry32(seed);
	const out = new Float32Array(CLIP_SAMPLES);
	for (let i = 0; i < CLIP_SAMPLES; i++) {
		out[i] = amplitude * (2 * rng() - 1);
	}
	return out;
}

/** Linear chirp from f0 to f1 over the clip. */
export function chirp(f0 = 100, f1 = 7000, amplitude = 0.5): Float32Array {
	const out = new Float32Array(CLIP_SAMPLES);
	const T = CLIP_SAMPLES / SAMPLE_RATE;
	for (let i = 0; i < CLIP_SAMPLES; i++) {
		const t = i / SAMPLE_RATE;
		const phase = 2 * Math.PI * (f0 * t + ((f1 - f0) / (2 * T)) * t * t);
		out[i] = amplitude * Math.sin(phase);
	}
	return out;
}

export interface GoldenSignal {
	name: string;
	pcm: Float32Array;
}

/** The five canonical golden signals, in fixed order. */
export function goldenSignals(): GoldenSignal[] {
	return [
		{ name: 'silence', pcm: silence() },
		{ name: 'sine_440', pcm: sine(440) },
		{ name: 'sine_1000', pcm: sine(1000) },
		{ name: 'noise_seed1234', pcm: whiteNoise(1234) },
		{ name: 'chirp_100_7000', pcm: chirp(100, 7000) },
	];
}
