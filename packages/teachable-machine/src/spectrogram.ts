import { NUM_FRAMES, NUM_MEL } from './dsp';

const STOPS: [number, number, number][] = [
	[68, 1, 84], [71, 44, 122], [59, 81, 139], [44, 113, 142], [33, 144, 141],
	[39, 173, 129], [92, 200, 99], [170, 220, 50], [253, 231, 37],
];

function viridis(value: number): [number, number, number] {
	if (!Number.isFinite(value)) value = 0.5;
	const x = Math.min(1, Math.max(0, value)) * (STOPS.length - 1);
	const index = Math.min(STOPS.length - 2, Math.floor(x));
	const fraction = x - index;
	return STOPS[index].map((channel, i) =>
		Math.round(channel + (STOPS[index + 1][i] - channel) * fraction)
	) as [number, number, number];
}

export function spectrogramIntensity(logMel: Float32Array): Float32Array {
	const finite = Array.from(logMel).filter(Number.isFinite).sort((a, b) => a - b);
	const out = new Float32Array(logMel.length);
	if (!finite.length) { out.fill(0.5); return out; }
	const low = finite[Math.floor((finite.length - 1) * 0.02)];
	const high = finite[Math.ceil((finite.length - 1) * 0.98)];
	const span = high - low;
	if (!(span > 1e-9)) { out.fill(0.5); return out; }
	for (let i = 0; i < logMel.length; i++) out[i] = Number.isFinite(logMel[i]) ? (logMel[i] - low) / span : 0;
	return out;
}

/** The library's only rendering helper; all other APIs are UI-independent. */
export function renderSpectrogram(canvas: HTMLCanvasElement, logMel: Float32Array): void {
	canvas.width = NUM_FRAMES;
	canvas.height = NUM_MEL;
	const context = canvas.getContext('2d');
	if (!context) return;
	const intensity = spectrogramIntensity(logMel);
	const image = context.createImageData(NUM_FRAMES, NUM_MEL);
	for (let t = 0; t < NUM_FRAMES; t++) for (let m = 0; m < NUM_MEL; m++) {
		const [r, g, b] = viridis(intensity[t * NUM_MEL + m]);
		const offset = ((NUM_MEL - 1 - m) * NUM_FRAMES + t) * 4;
		image.data[offset] = r; image.data[offset + 1] = g; image.data[offset + 2] = b; image.data[offset + 3] = 255;
	}
	context.putImageData(image, 0, 0);
}
