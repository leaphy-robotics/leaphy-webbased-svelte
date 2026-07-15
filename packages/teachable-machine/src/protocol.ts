import { EMBEDDING_DIM, FEATURE_SIZE } from './dsp';

export const TRAINER_PROTOCOL_VERSION = 4;

export type TrainerMessage =
	| { type: 'hello'; version: number }
	| { type: 'ready' }
	| { type: 'preparing'; total: number; delayMs: number }
	| { type: 'recordingBatch'; total: number }
	| { type: 'captured'; total: number }
	| { type: 'feature'; sample: number; total: number; embedding: Float32Array }
	| { type: 'spectrogram'; sample: number; total: number; logMel: Float32Array }
	| { type: 'liveFeature'; embedding: Float32Array }
	| { type: 'done'; total: number }
	| { type: 'error'; message: string }
	| { type: 'unknown'; line: string };

export function parseTrainerLine(raw: string): TrainerMessage {
	const line = raw.trim();
	if (line === 'READY') return { type: 'ready' };
	let match = /^TEACHABLE_AUDIO_TRAINER (\d+)$/.exec(line);
	if (match) return { type: 'hello', version: Number(match[1]) };
	match = /^PREPARING (\d+) (\d+)$/.exec(line);
	if (match) return { type: 'preparing', total: Number(match[1]), delayMs: Number(match[2]) };
	match = /^RECORDING_BATCH (\d+)$/.exec(line);
	if (match) return { type: 'recordingBatch', total: Number(match[1]) };
	match = /^CAPTURED (\d+)$/.exec(line);
	if (match) return { type: 'captured', total: Number(match[1]) };
	match = /^DONE (\d+)$/.exec(line);
	if (match) return { type: 'done', total: Number(match[1]) };
	if (line.startsWith('ERROR ')) return { type: 'error', message: line.slice(6) };
	if (line.startsWith('LIVE_FEATURE ')) {
		const values = line.slice(13).split(',').map(Number);
		if (values.length !== EMBEDDING_DIM || values.some((value) => !Number.isFinite(value))) {
			return { type: 'error', message: `invalid live feature vector (${values.length}/${EMBEDDING_DIM} values)` };
		}
		return { type: 'liveFeature', embedding: Float32Array.from(values) };
	}
	match = /^SPECTROGRAM (\d+) (\d+) (.+)$/.exec(line);
	if (match) {
		const values = match[3].split(',').map(Number);
		if (values.length !== FEATURE_SIZE || values.some((value) => !Number.isFinite(value))) {
			return { type: 'error', message: `invalid spectrogram (${values.length}/${FEATURE_SIZE} values)` };
		}
		return { type: 'spectrogram', sample: Number(match[1]), total: Number(match[2]), logMel: Float32Array.from(values) };
	}
	match = /^FEATURE (\d+) (\d+) (.+)$/.exec(line);
	if (match) {
		const values = match[3].split(',').map(Number);
		if (values.length !== EMBEDDING_DIM || values.some((value) => !Number.isFinite(value))) {
			return { type: 'error', message: `invalid feature vector (${values.length}/${EMBEDDING_DIM} values)` };
		}
		return { type: 'feature', sample: Number(match[1]), total: Number(match[2]), embedding: Float32Array.from(values) };
	}
	return { type: 'unknown', line };
}
