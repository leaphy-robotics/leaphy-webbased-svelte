export {
	type AugmentationOptions,
	buildAugmentedDataset,
	layerNoise,
} from "./augment";
export { TrainedAudioModel } from "./model";
export {
	classColors,
	generateModelHeader,
	type HeaderOptions,
} from "./model-header";
export {
	parseTrainerLine,
	TRAINER_PROTOCOL_VERSION,
	type TrainerMessage,
} from "./protocol";
export { type TrainOptions, trainAudioModel } from "./train";
export type { TrainedHead, TrainingSample } from "./types";
