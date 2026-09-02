import type { Block } from "blockly/core";
import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";

function getCodeGenerators(arduino: Arduino) {
	function addTeachableAudioDetails() {
		arduino.addDependency(Dependencies.TEACHABLE_AUDIO);
		arduino.addInclude("teachable_audio", "#include <TeachableAudio.h>");
		arduino.addDefinition(
			"teachable_audio_model",
			arduino.teachableMachineModelHeaders ||
				'#error "Train a Teachable Machine audio model before using its blocks"',
		);
		arduino.addDefinition(
			"teachable_audio",
			"TeachableAudio::AudioFrontend teachableAudio;\n" +
				"float teachableAudioEmbedding[EMBEDDING_DIM];\n" +
				"float teachableAudioProbabilities[NUM_CLASSES];\n" +
				"int teachableAudioPrediction = BACKGROUND_CLASS_INDEX;",
		);
		arduino.addSetup("teachable_audio", "teachableAudio.beginAnalog(A0);");
	}

	function getTeachableClassIndex(block: Block) {
		const index = Number.parseInt(block.getFieldValue("CLASS"), 10);
		return Number.isFinite(index) ? Math.max(0, index) : 0;
	}

	arduino.forBlock.teachable_audio_classify = () => {
		addTeachableAudioDetails();
		return (
			"teachableAudio.captureEmbedding(teachableAudioEmbedding);\n" +
			"TeachableAudio::classify(teachableAudioEmbedding, &HEAD_WEIGHTS[0][0], HEAD_BIAS, NUM_CLASSES, teachableAudioProbabilities);\n" +
			"teachableAudioPrediction = TeachableAudio::argmax(teachableAudioProbabilities, NUM_CLASSES);\n"
		);
	};

	arduino.forBlock.teachable_audio_detected = (block) => {
		addTeachableAudioDetails();
		const index = getTeachableClassIndex(block);
		return [
			`(teachableAudioPrediction == ${index} && teachableAudioProbabilities[${index}] >= DETECTION_THRESHOLD)`,
			arduino.ORDER_LOGICAL_AND,
		];
	};

	arduino.forBlock.teachable_audio_confidence = (block) => {
		addTeachableAudioDetails();
		const index = getTeachableClassIndex(block);
		return [
			`(teachableAudioProbabilities[${index}] * 100.0f)`,
			arduino.ORDER_MULTIPLICATIVE,
		];
	};
}

export default getCodeGenerators;
