import { EMBEDDING_DIM, FEATURE_SIZE } from "./dsp";

export const TRAINER_PROTOCOL_VERSION = 4;

export type TrainerMessage =
	| { type: "hello"; version: number }
	| { type: "ready" }
	| { type: "preparing"; total: number; delayMs: number }
	| { type: "recordingBatch"; total: number }
	| { type: "captured"; total: number }
	| { type: "feature"; sample: number; total: number; embedding: Float32Array }
	| { type: "spectrogram"; sample: number; total: number; logMel: Float32Array }
	| { type: "liveFeature"; embedding: Float32Array }
	| { type: "done"; total: number }
	| { type: "error"; message: string }
	| { type: "unknown"; line: string };

const COUNT_MESSAGES = [
	[/^RECORDING_BATCH (\d+)$/, "recordingBatch"],
	[/^CAPTURED (\d+)$/, "captured"],
	[/^DONE (\d+)$/, "done"],
] as const;

function parseVector(
	value: string,
	expectedLength: number,
	name: string,
): Float32Array | TrainerMessage {
	const values = value.split(",").map(Number);
	if (
		values.length !== expectedLength ||
		values.some((item) => !Number.isFinite(item))
	) {
		return {
			type: "error",
			message: `invalid ${name} (${values.length}/${expectedLength} values)`,
		};
	}
	return Float32Array.from(values);
}

export function parseTrainerLine(raw: string): TrainerMessage {
	const line = raw.trim();
	if (line === "READY") return { type: "ready" };

	let match = /^TEACHABLE_AUDIO_TRAINER (\d+)$/.exec(line);
	if (match) return { type: "hello", version: Number(match[1]) };

	match = /^PREPARING (\d+) (\d+)$/.exec(line);
	if (match)
		return {
			type: "preparing",
			total: Number(match[1]),
			delayMs: Number(match[2]),
		};

	for (const [pattern, type] of COUNT_MESSAGES) {
		match = pattern.exec(line);
		if (match) return { type, total: Number(match[1]) };
	}

	if (line.startsWith("ERROR "))
		return { type: "error", message: line.slice(6) };

	if (line.startsWith("LIVE_FEATURE ")) {
		const embedding = parseVector(
			line.slice(13),
			EMBEDDING_DIM,
			"live feature vector",
		);
		return embedding instanceof Float32Array
			? { type: "liveFeature", embedding }
			: embedding;
	}

	match = /^SPECTROGRAM (\d+) (\d+) (.+)$/.exec(line);
	if (match) {
		const logMel = parseVector(match[3], FEATURE_SIZE, "spectrogram");
		if (!(logMel instanceof Float32Array)) return logMel;
		return {
			type: "spectrogram",
			sample: Number(match[1]),
			total: Number(match[2]),
			logMel,
		};
	}

	match = /^FEATURE (\d+) (\d+) (.+)$/.exec(line);
	if (match) {
		const embedding = parseVector(match[3], EMBEDDING_DIM, "feature vector");
		if (!(embedding instanceof Float32Array)) return embedding;
		return {
			type: "feature",
			sample: Number(match[1]),
			total: Number(match[2]),
			embedding,
		};
	}

	return { type: "unknown", line };
}
