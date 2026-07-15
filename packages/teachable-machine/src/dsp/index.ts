/**
 * Teachable Audio DSP — TypeScript reference implementation.
 *
 * This file is one half of a dual implementation; the other half is
 * packages/dsp-c (dsp.c / embedding.c). The two MUST stay in lockstep:
 * any change here requires the same change there and a re-run of the
 * golden-vector parity harness (`npm run test:parity`).
 *
 * Precision model: the ESP32-S3 runs the DSP in float32, so this
 * implementation stores all signal-path intermediates in Float32Array and
 * rounds products with Math.fround. Accumulations that the C side performs
 * in double (normalization and embedding statistics, filterbank design)
 * are done in double here too. This keeps browser and MCU outputs within
 * a few float32 ulps of each other — far inside the 1e-3 parity tolerance.
 *
 * Specification:
 *   input        16 000 Hz mono float32 PCM in [-1, 1], 1.0 s (16 000 samples)
 *   framing      30 ms frames (480 samples), 20 ms stride (320) -> 49 frames
 *   window       Hann (symmetric): 0.5 - 0.5*cos(2*pi*n / (N-1))
 *   FFT          512-point radix-2 (frame zero-padded), power spectrum bins 0..256
 *   mel          40 triangular filters, 125–7500 Hz, HTK mel scale
 *   log          natural log(x + 1e-6)
 *   output       49 x 40 feature matrix, then per-clip normalization:
 *                (x - mean) / (std + 1e-6) over the whole matrix
 *   embedding    per-mel-bin mean, std and delta-mean of the normalized
 *                matrix -> 120-dim vector
 */

export const SAMPLE_RATE = 16000;
export const CLIP_SAMPLES = 16000;
export const FRAME_SIZE = 480;
export const FRAME_STRIDE = 320;
export const NUM_FRAMES = 49; // 1 + floor((16000 - 480) / 320)
export const FFT_SIZE = 512;
export const NUM_BINS = 257; // FFT_SIZE / 2 + 1
export const NUM_MEL = 40;
export const MEL_LOW_HZ = 125;
export const MEL_HIGH_HZ = 7500;
export const LOG_OFFSET = 1e-6;
export const NORM_EPS = 1e-6;
export const FEATURE_SIZE = NUM_FRAMES * NUM_MEL; // 1960
export const EMBEDDING_DIM = 3 * NUM_MEL; // 120

const f32 = Math.fround;

/* ------------------------------------------------------------------ */
/* Hann window                                                         */
/* ------------------------------------------------------------------ */

const hannWindow: Float32Array = (() => {
	const w = new Float32Array(FRAME_SIZE);
	for (let n = 0; n < FRAME_SIZE; n++) {
		w[n] = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (FRAME_SIZE - 1));
	}
	return w;
})();

/** Exposed for tests. */
export function getHannWindow(): Float32Array {
	return hannWindow;
}

/* ------------------------------------------------------------------ */
/* FFT — iterative radix-2, decimation in time                         */
/* ------------------------------------------------------------------ */

// Precomputed twiddle factors: w[k] = exp(-2*pi*i * k / FFT_SIZE), k in [0, FFT_SIZE/2)
const twiddleRe = new Float32Array(FFT_SIZE / 2);
const twiddleIm = new Float32Array(FFT_SIZE / 2);
for (let k = 0; k < FFT_SIZE / 2; k++) {
	const ang = (-2 * Math.PI * k) / FFT_SIZE;
	twiddleRe[k] = Math.cos(ang);
	twiddleIm[k] = Math.sin(ang);
}

/**
 * In-place 512-point complex FFT (radix-2 DIT with bit-reversal permutation),
 * float32 arithmetic. Mirrors fft_512() in dsp.c.
 */
export function fft512(re: Float32Array, im: Float32Array): void {
	const n = FFT_SIZE;
	// bit-reversal permutation (n = 512 -> 9 bits)
	for (let i = 1, j = 0; i < n; i++) {
		let bit = n >> 1;
		for (; j & bit; bit >>= 1) j ^= bit;
		j ^= bit;
		if (i < j) {
			let t = re[i];
			re[i] = re[j];
			re[j] = t;
			t = im[i];
			im[i] = im[j];
			im[j] = t;
		}
	}
	for (let len = 2; len <= n; len <<= 1) {
		const half = len >> 1;
		const step = n / len; // twiddle stride
		for (let i = 0; i < n; i += len) {
			for (let j = 0; j < half; j++) {
				const wRe = twiddleRe[j * step];
				const wIm = twiddleIm[j * step];
				const a = i + j;
				const b = a + half;
				const tRe = f32(f32(re[b] * wRe) - f32(im[b] * wIm));
				const tIm = f32(f32(re[b] * wIm) + f32(im[b] * wRe));
				re[b] = re[a] - tRe; // Float32Array store rounds to f32
				im[b] = im[a] - tIm;
				re[a] += tRe;
				im[a] += tIm;
			}
		}
	}
}

/* ------------------------------------------------------------------ */
/* Mel filterbank                                                      */
/* ------------------------------------------------------------------ */

export function hzToMel(hz: number): number {
	return 2595 * Math.log10(1 + hz / 700);
}

export function melToHz(mel: number): number {
	return 700 * (10 ** (mel / 2595) - 1);
}

export interface MelFilterbank {
	/** first FFT bin with non-zero weight, per filter */
	starts: Int32Array;
	/** number of bins covered, per filter */
	lengths: Int32Array;
	/** filter m occupies weights[offsets[m] .. offsets[m] + lengths[m]) */
	offsets: Int32Array;
	/** concatenated triangular weights, stored as float32 */
	weights: Float32Array;
}

/**
 * Triangular mel filterbank on FFT bin center frequencies (k * sr / FFT_SIZE),
 * stored sparsely. Weight design is done in double precision and stored as
 * float32 — dsp_init() in dsp.c does exactly the same.
 */
export function buildMelFilterbank(): MelFilterbank {
	const melPoints = new Float64Array(NUM_MEL + 2);
	const melLow = hzToMel(MEL_LOW_HZ);
	const melHigh = hzToMel(MEL_HIGH_HZ);
	for (let i = 0; i < NUM_MEL + 2; i++) {
		melPoints[i] = melToHz(melLow + ((melHigh - melLow) * i) / (NUM_MEL + 1));
	}
	const starts = new Int32Array(NUM_MEL);
	const lengths = new Int32Array(NUM_MEL);
	const offsets = new Int32Array(NUM_MEL);
	const weightList: number[] = [];
	const binHz = SAMPLE_RATE / FFT_SIZE; // 31.25, exact in binary
	for (let m = 0; m < NUM_MEL; m++) {
		const left = melPoints[m];
		const center = melPoints[m + 1];
		const right = melPoints[m + 2];
		let start = -1;
		const w: number[] = [];
		for (let k = 0; k < NUM_BINS; k++) {
			const f = k * binHz;
			let weight = 0;
			if (f > left && f < center) weight = (f - left) / (center - left);
			else if (f >= center && f < right)
				weight = (right - f) / (right - center);
			if (weight > 0) {
				if (start < 0) start = k;
				w.push(weight);
			} else if (start >= 0) {
				break; // contiguous support ended
			}
		}
		starts[m] = start < 0 ? 0 : start;
		lengths[m] = w.length;
		offsets[m] = weightList.length;
		for (const x of w) weightList.push(x);
	}
	return { starts, lengths, offsets, weights: Float32Array.from(weightList) };
}

const melBank = buildMelFilterbank();

/* ------------------------------------------------------------------ */
/* Feature extraction                                                  */
/* ------------------------------------------------------------------ */

const fftRe = new Float32Array(FFT_SIZE);
const fftIm = new Float32Array(FFT_SIZE);
const power = new Float32Array(NUM_BINS);

/**
 * Compute the raw (un-normalized) 49x40 log-mel matrix, row-major
 * [frame][mel]. Mirrors the per-frame loop in dsp_compute_features().
 */
export function computeLogMel(pcm: Float32Array): Float32Array {
	if (pcm.length !== CLIP_SAMPLES) {
		throw new Error(`expected ${CLIP_SAMPLES} samples, got ${pcm.length}`);
	}
	const out = new Float32Array(FEATURE_SIZE);
	for (let t = 0; t < NUM_FRAMES; t++) {
		const off = t * FRAME_STRIDE;
		for (let n = 0; n < FRAME_SIZE; n++) {
			fftRe[n] = pcm[off + n] * hannWindow[n];
			fftIm[n] = 0;
		}
		fftRe.fill(0, FRAME_SIZE);
		fftIm.fill(0, FRAME_SIZE);
		fft512(fftRe, fftIm);
		for (let k = 0; k < NUM_BINS; k++) {
			power[k] = f32(fftRe[k] * fftRe[k]) + f32(fftIm[k] * fftIm[k]);
		}
		for (let m = 0; m < NUM_MEL; m++) {
			let sum = f32(0);
			const start = melBank.starts[m];
			const len = melBank.lengths[m];
			const woff = melBank.offsets[m];
			for (let i = 0; i < len; i++) {
				sum = f32(sum + f32(power[start + i] * melBank.weights[woff + i]));
			}
			out[t * NUM_MEL + m] = Math.log(f32(sum + f32(LOG_OFFSET)));
		}
	}
	return out;
}

/**
 * In-place per-clip normalization over the whole 49x40 matrix:
 * subtract mean, divide by (population std + 1e-6).
 * Accumulation in double, matching dsp_normalize() in dsp.c.
 */
export function normalizeFeatures(features: Float32Array): void {
	let mean = 0;
	for (let i = 0; i < features.length; i++) mean += features[i];
	mean /= features.length;
	let variance = 0;
	for (let i = 0; i < features.length; i++) {
		const d = features[i] - mean;
		variance += d * d;
	}
	variance /= features.length;
	const inv = 1 / (Math.sqrt(variance) + NORM_EPS);
	for (let i = 0; i < features.length; i++) {
		features[i] = (features[i] - mean) * inv;
	}
}

/** Full pipeline: PCM -> normalized 49x40 feature matrix (row-major). */
export function computeFeatures(pcm: Float32Array): Float32Array {
	const f = computeLogMel(pcm);
	normalizeFeatures(f);
	return f;
}

/* ------------------------------------------------------------------ */
/* Embedding                                                           */
/* ------------------------------------------------------------------ */

/**
 * Deterministic 120-dim embedding from the normalized 49x40 matrix:
 *   emb[0..39]    per-mel-bin mean over frames
 *   emb[40..79]   per-mel-bin population std over frames
 *   emb[80..119]  per-mel-bin mean of frame-to-frame differences
 * Accumulation in double, matching embed() in embedding.c.
 */
export function embed(features: Float32Array): Float32Array {
	const emb = new Float32Array(EMBEDDING_DIM);
	for (let m = 0; m < NUM_MEL; m++) {
		let mean = 0;
		for (let t = 0; t < NUM_FRAMES; t++) mean += features[t * NUM_MEL + m];
		mean /= NUM_FRAMES;
		let variance = 0;
		for (let t = 0; t < NUM_FRAMES; t++) {
			const d = features[t * NUM_MEL + m] - mean;
			variance += d * d;
		}
		variance /= NUM_FRAMES;
		let delta = 0;
		for (let t = 1; t < NUM_FRAMES; t++) {
			delta += features[t * NUM_MEL + m] - features[(t - 1) * NUM_MEL + m];
		}
		delta /= NUM_FRAMES - 1;
		emb[m] = mean;
		emb[NUM_MEL + m] = Math.sqrt(variance);
		emb[2 * NUM_MEL + m] = delta;
	}
	return emb;
}

/** Convenience: PCM straight to embedding. */
export function embedPcm(pcm: Float32Array): Float32Array {
	return embed(computeFeatures(pcm));
}

/* ------------------------------------------------------------------ */
/* Head inference (reference; mirrors head_infer() in embedding.c)     */
/* ------------------------------------------------------------------ */

/**
 * Dense layer + softmax: probs[c] = softmax(W[c] . emb + b[c]).
 * `weights` is row-major [numClasses][EMBEDDING_DIM].
 */
export function headInfer(
	emb: Float32Array,
	weights: Float32Array,
	bias: Float32Array,
	numClasses: number,
): Float32Array {
	const logits = new Float32Array(numClasses);
	for (let c = 0; c < numClasses; c++) {
		let acc = bias[c];
		for (let d = 0; d < EMBEDDING_DIM; d++) {
			acc += weights[c * EMBEDDING_DIM + d] * emb[d];
		}
		logits[c] = acc;
	}
	let max = logits[0];
	for (let c = 1; c < numClasses; c++) if (logits[c] > max) max = logits[c];
	let sum = 0;
	const probs = new Float32Array(numClasses);
	for (let c = 0; c < numClasses; c++) {
		probs[c] = Math.exp(logits[c] - max);
		sum += probs[c];
	}
	for (let c = 0; c < numClasses; c++) probs[c] /= sum;
	return probs;
}
