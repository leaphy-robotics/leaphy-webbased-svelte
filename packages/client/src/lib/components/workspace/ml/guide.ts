import type { TranslatedMessage } from "$state/ml.svelte";
import MLState, { MIN_SAMPLES_PER_CLASS } from "$state/ml.svelte";

export interface GuideItem extends TranslatedMessage {
	done: boolean;
}

export interface StepGuide {
	title: string;
	// Why the step can't be opened yet, shown while it is locked
	lockedReason: string;
	checklist: GuideItem[];
	tip: { title: string; text: string };
}

// Describes what the user should do in every step of the ML flow, and the analogy that explains why
export function getGuides(): StepGuide[] {
	return [
		{
			title: "ML_STEP_PREPARE",
			lockedReason: "",
			checklist: [
				{ key: "ML_TODO_ADD_SENSOR", done: MLState.hasSensors },
				{ key: "ML_TODO_UPLOAD_COLLECTOR", done: MLState.collectorUploaded },
			],
			tip: { title: "ML_TIP_PREPARE_TITLE", text: "ML_TIP_PREPARE_TEXT" },
		},
		{
			title: "ML_STEP_COLLECT",
			lockedReason: "ML_LOCKED_COLLECT",
			checklist: [
				{
					key: "ML_TODO_CONNECT",
					done: MLState.connected,
				},
				{
					key: "ML_TODO_ASSIGN_KEYS",
					done: MLState.classes.every((classData) => !!classData.key),
				},
				{ key: "ML_TODO_RECORD", done: MLState.hasData },
				{
					key: "ML_TODO_ENOUGH_EXAMPLES",
					values: { minimum: MIN_SAMPLES_PER_CLASS },
					done: MLState.hasData && MLState.trainingIssues.length === 0,
				},
			],
			tip: { title: "ML_TIP_COLLECT_TITLE", text: "ML_TIP_COLLECT_TEXT" },
		},
		{
			title: "ML_STEP_TRAIN",
			lockedReason: "ML_LOCKED_TRAIN",
			checklist: [
				{
					key: "ML_TODO_CHECK_EXAMPLES",
					done: MLState.hasData && MLState.trainingIssues.length === 0,
				},
				{ key: "ML_TODO_TRAIN", done: MLState.isTrained },
			],
			tip: { title: "ML_TIP_TRAIN_TITLE", text: "ML_TIP_TRAIN_TEXT" },
		},
		{
			title: "ML_STEP_RESULT",
			lockedReason: "ML_LOCKED_RESULT",
			checklist: [
				{ key: "ML_TODO_CHECK_RESULTS", done: MLState.isTrained },
				{
					key: "ML_TODO_UPLOAD_MODEL",
					done: MLState.modelUpload === "success",
				},
				{ key: "ML_TODO_USE_BLOCKS", done: false },
			],
			tip: { title: "ML_TIP_RESULT_TITLE", text: "ML_TIP_RESULT_TEXT" },
		},
	];
}
