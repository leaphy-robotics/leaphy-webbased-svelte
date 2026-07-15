import { EMBEDDING_DIM } from "./dsp";
import type { TrainedHead } from "./types";

const PALETTE: [number, number, number][] = [
	[0, 255, 0],
	[0, 80, 255],
	[255, 140, 0],
	[255, 0, 90],
	[170, 0, 255],
	[0, 255, 200],
	[255, 255, 0],
	[255, 255, 255],
];

export function classColors(
	count: number,
	backgroundIndex: number,
): [number, number, number][] {
	let color = 0;
	return Array.from({ length: count }, (_, i) =>
		i === backgroundIndex ? [0, 0, 0] : PALETTE[color++ % PALETTE.length],
	);
}

function literal(value: number): string {
	if (!Number.isFinite(value))
		throw new Error("model contains a non-finite value");
	return `${value.toExponential(8)}f`;
}

function cString(value: string): string {
	return `"${value
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/[\r\n]/g, " ")}"`;
}

export interface HeaderOptions {
	classNames: string[];
	backgroundIndex: number;
	threshold?: number;
	colors?: [number, number, number][];
}

/** Generate model_weights.h consumed directly by the Arduino library examples. */
export function generateModelHeader(
	model: Pick<TrainedHead, "weights" | "bias">,
	options: HeaderOptions,
): string {
	const count = options.classNames.length;
	if (
		model.weights.length !== count * EMBEDDING_DIM ||
		model.bias.length !== count
	)
		throw new Error("model/class shape mismatch");
	const colors = options.colors ?? classColors(count, options.backgroundIndex);
	const rows: string[] = [];
	for (let c = 0; c < count; c++) {
		rows.push(
			`  { ${Array.from(model.weights.subarray(c * EMBEDDING_DIM, (c + 1) * EMBEDDING_DIM), literal).join(", ")} }`,
		);
	}
	return `#ifndef MODEL_WEIGHTS_H
#define MODEL_WEIGHTS_H
#define NUM_CLASSES ${count}
#define BACKGROUND_CLASS_INDEX ${options.backgroundIndex}
static const float DETECTION_THRESHOLD = ${literal(options.threshold ?? 0.8)};
static const char *const CLASS_NAMES[NUM_CLASSES] = { ${options.classNames.map(cString).join(", ")} };
static const unsigned char CLASS_COLORS[NUM_CLASSES][3] = { ${colors.map((c) => `{${c.join(", ")}}`).join(", ")} };
static const float HEAD_BIAS[NUM_CLASSES] = { ${Array.from(model.bias, literal).join(", ")} };
static const float HEAD_WEIGHTS[NUM_CLASSES][${EMBEDDING_DIM}] = {
${rows.join(",\n")}
};
#endif
`;
}
