import {
	buildMelFilterbank,
	CLIP_SAMPLES,
	computeFeatures,
	computeLogMel,
	EMBEDDING_DIM,
	embed,
	FEATURE_SIZE,
	FFT_SIZE,
	FRAME_SIZE,
	FRAME_STRIDE,
	fft512,
	getHannWindow,
	headInfer,
	hzToMel,
	melToHz,
	NUM_BINS,
	NUM_FRAMES,
	NUM_MEL,
	normalizeFeatures,
} from "@teachable/dsp-ts";
import {
	chirp,
	goldenSignals,
	sine,
	whiteNoise,
} from "@teachable/dsp-ts/signals";
import { describe, expect, it } from "vitest";

describe("framing", () => {
	it("spec constants produce exactly 49 frames covering the clip", () => {
		const frames = 1 + Math.floor((CLIP_SAMPLES - FRAME_SIZE) / FRAME_STRIDE);
		expect(frames).toBe(NUM_FRAMES);
		const lastFrameEnd = (NUM_FRAMES - 1) * FRAME_STRIDE + FRAME_SIZE;
		expect(lastFrameEnd).toBeLessThanOrEqual(CLIP_SAMPLES);
	});

	it("feature matrix is 49 x 40", () => {
		const feats = computeLogMel(sine(440));
		expect(feats.length).toBe(NUM_FRAMES * NUM_MEL);
		expect(feats.length).toBe(FEATURE_SIZE);
	});
});

describe("Hann window", () => {
	it("is symmetric, zero at edges, one at center", () => {
		const w = getHannWindow();
		expect(w[0]).toBeCloseTo(0, 6);
		expect(w[FRAME_SIZE - 1]).toBeCloseTo(0, 6);
		for (let n = 0; n < FRAME_SIZE; n++) {
			expect(w[n]).toBeCloseTo(w[FRAME_SIZE - 1 - n], 6);
		}
		// symmetric window with odd-index peak: max at (N-1)/2 neighbours
		expect(Math.max(...w)).toBeGreaterThan(0.9999);
	});
});

describe("fft512", () => {
	it("matches the analytic DFT of an impulse", () => {
		const re = new Float32Array(FFT_SIZE);
		const im = new Float32Array(FFT_SIZE);
		re[0] = 1;
		fft512(re, im);
		for (let k = 0; k < FFT_SIZE; k += 37) {
			expect(re[k]).toBeCloseTo(1, 5);
			expect(im[k]).toBeCloseTo(0, 5);
		}
	});

	it("concentrates a bin-aligned sinusoid into the right bin", () => {
		// 1000 Hz is bin 32 exactly (1000 / 31.25)
		const re = new Float32Array(FFT_SIZE);
		const im = new Float32Array(FFT_SIZE);
		for (let n = 0; n < FFT_SIZE; n++) {
			re[n] = Math.cos((2 * Math.PI * 32 * n) / FFT_SIZE);
		}
		fft512(re, im);
		expect(re[32]).toBeCloseTo(FFT_SIZE / 2, 2);
		expect(Math.abs(re[33])).toBeLessThan(1e-3);
	});
});

describe("mel filterbank", () => {
	const bank = buildMelFilterbank();

	it("mel scale round-trips", () => {
		for (const hz of [125, 440, 1000, 3000, 7500]) {
			expect(melToHz(hzToMel(hz))).toBeCloseTo(hz, 6);
		}
	});

	it("has 40 filters, each with non-empty contiguous support", () => {
		expect(bank.starts.length).toBe(NUM_MEL);
		for (let m = 0; m < NUM_MEL; m++) {
			expect(bank.lengths[m]).toBeGreaterThan(0);
			expect(bank.starts[m]).toBeGreaterThanOrEqual(0);
			expect(bank.starts[m] + bank.lengths[m]).toBeLessThanOrEqual(NUM_BINS);
		}
	});

	it("row sums are positive and bounded by the triangle area", () => {
		for (let m = 0; m < NUM_MEL; m++) {
			let sum = 0;
			for (let i = 0; i < bank.lengths[m]; i++)
				sum += bank.weights[bank.offsets[m] + i];
			expect(sum).toBeGreaterThan(0);
			// a triangle sampled every 31.25 Hz sums to roughly (right-left)/2/31.25
			expect(sum).toBeLessThan(NUM_BINS);
		}
	});

	it("weights are in (0, 1]", () => {
		for (const w of bank.weights) {
			expect(w).toBeGreaterThan(0);
			expect(w).toBeLessThanOrEqual(1);
		}
	});

	it("adjacent filters overlap (triangles share the center point)", () => {
		for (let m = 0; m + 1 < NUM_MEL; m++) {
			const endM = bank.starts[m] + bank.lengths[m] - 1;
			expect(endM).toBeGreaterThanOrEqual(bank.starts[m + 1]);
		}
	});
});

describe("normalization", () => {
	it("produces mean ~0 and std ~1 over the whole matrix", () => {
		const feats = computeLogMel(whiteNoise(42));
		normalizeFeatures(feats);
		let mean = 0;
		for (const x of feats) mean += x;
		mean /= feats.length;
		let variance = 0;
		for (const x of feats) variance += (x - mean) * (x - mean);
		variance /= feats.length;
		expect(Math.abs(mean)).toBeLessThan(1e-4);
		expect(Math.sqrt(variance)).toBeCloseTo(1, 3);
	});

	it("is stable on silence (all zeros in, all zeros out)", () => {
		const feats = computeFeatures(new Float32Array(CLIP_SAMPLES));
		for (const x of feats) expect(x).toBe(0);
	});
});

describe("embedding", () => {
	it("is 120-dim and deterministic", () => {
		const a = embed(computeFeatures(sine(440)));
		const b = embed(computeFeatures(sine(440)));
		expect(a.length).toBe(EMBEDDING_DIM);
		expect(Array.from(a)).toEqual(Array.from(b));
	});

	it("separates distinct signals", () => {
		const a = embed(computeFeatures(sine(440)));
		const b = embed(computeFeatures(chirp()));
		let dist = 0;
		for (let i = 0; i < EMBEDDING_DIM; i++) dist += (a[i] - b[i]) ** 2;
		expect(Math.sqrt(dist)).toBeGreaterThan(1);
	});

	it("golden signals all produce finite features and embeddings", () => {
		for (const { pcm } of goldenSignals()) {
			const feats = computeFeatures(pcm);
			const emb = embed(feats);
			for (const x of feats) expect(Number.isFinite(x)).toBe(true);
			for (const x of emb) expect(Number.isFinite(x)).toBe(true);
		}
	});
});

describe("headInfer", () => {
	it("computes a valid softmax that prefers the aligned class", () => {
		const emb = new Float32Array(EMBEDDING_DIM).fill(0.1);
		const numClasses = 3;
		const weights = new Float32Array(numClasses * EMBEDDING_DIM);
		// class 1 aligned with the embedding
		for (let d = 0; d < EMBEDDING_DIM; d++) weights[1 * EMBEDDING_DIM + d] = 1;
		const bias = new Float32Array(numClasses);
		const probs = headInfer(emb, weights, bias, numClasses);
		let sum = 0;
		for (const p of probs) sum += p;
		expect(sum).toBeCloseTo(1, 5);
		expect(probs[1]).toBeGreaterThan(probs[0]);
		expect(probs[1]).toBeGreaterThan(probs[2]);
	});
});
