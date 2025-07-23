import {
	type Class,
	SensorData,
	SensorReference,
	ml,
} from "../../categories/ml";
import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";

function getClassName(classData: Class) {
	return `class_${classData.name.replaceAll(" ", "_")}`;
}

function getCodeGenerators(arduino: Arduino) {
	function addBluetoothDetails() {
		arduino.addDependency(Dependencies.ARDUINO_BLE);
		arduino.addInclude("bluetooth", "#include <ArduinoBLE.h>");
		arduino.addDefinition(
			"bluetooth",
			`BLEService controlService("${ml.trainingID}");\n` +
				`float inputBuffer[${ml.getSensors().length}];\n` +
				`BLECharacteristic input("f0e84eb0-f3ed-495c-926c-b2e3815415a7", BLERead | BLENotify, ${ml.getSensors().length * 4});\n` +
				`bool outputBuffer[${ml.getClasses().length}];\n` +
				`BLECharacteristic output("6f1c1de7-bc7d-4bcb-a30e-918b82d115e8", BLEWrite, ${ml.getClasses().length});\n`,
		);

		arduino.addDeclaration(
			"bluetooth",
			`void onOutputWrite(BLEDevice central, BLECharacteristic characteristic) {\n  characteristic.readValue(outputBuffer, ${ml.getClasses().length});\n}\n`,
		);

		arduino.addSetup(
			"bluetooth",
			"BLE.begin();\n" +
				'  BLE.setLocalName("Leaphy ML");\n' +
				"  BLE.setAdvertisedService(controlService);\n" +
				"  controlService.addCharacteristic(input);\n" +
				"  controlService.addCharacteristic(output);\n" +
				"  output.setEventHandler(BLEWritten, onOutputWrite);\n" +
				"  BLE.addService(controlService);\n" +
				"  BLE.advertise();",
		);
	}

	function addTensorFlowDetails() {
		arduino.addDependency(Dependencies.TENSORFLOW_ESP32);
		arduino.addInclude(
			"tensorflow",
			"#include <TensorFlowLite_ESP32.h>\n" +
				'#include "tensorflow/lite/micro/all_ops_resolver.h"\n' +
				'#include "tensorflow/lite/micro/micro_error_reporter.h"\n' +
				'#include "tensorflow/lite/micro/micro_interpreter.h"\n' +
				'#include "tensorflow/lite/schema/schema_generated.h"',
		);

		arduino.addDefinition("tensorflow_model", ml.modelHeaders || "");

		arduino.addDefinition(
			"tensorflow",
			"tflite::ErrorReporter* error_reporter = nullptr;\n" +
				"const tflite::Model* model = nullptr;\n" +
				"tflite::MicroInterpreter* interpreter = nullptr;\n" +
				"TfLiteTensor* input = nullptr;\n" +
				"TfLiteTensor* output = nullptr;\n" +
				"constexpr int kTensorArenaSize = 250 * 1024;\n" +
				"uint8_t tensor_arena[kTensorArenaSize];",
		);

		arduino.addDeclaration(
			"tensorflow",
			"bool setupTensorFlow() {\n" +
				"    static tflite::MicroErrorReporter micro_error_reporter;\n" +
				"    error_reporter = &micro_error_reporter;\n" +
				"    \n" +
				"    // Map the model into a usable data structure\n" +
				"    model = tflite::GetModel(model_data);\n" +
				"    if (model == nullptr) {\n" +
				'        Serial.println("ERROR: Failed to load model!");\n' +
				"        return false;\n" +
				"    }\n" +
				"    \n" +
				"    if (model->version() != TFLITE_SCHEMA_VERSION) {\n" +
				'        Serial.printf("ERROR: Model schema version mismatch! Model: %d, Expected: %d\\n",\n' +
				"                      model->version(), TFLITE_SCHEMA_VERSION);\n" +
				"        return false;\n" +
				"    }\n" +
				'    Serial.println("Schema version OK");\n' +
				"    \n" +
				"    static tflite::AllOpsResolver resolver;\n" +
				"    \n" +
				"    static tflite::MicroInterpreter static_interpreter(\n" +
				"        model, resolver, tensor_arena, kTensorArenaSize, error_reporter);\n" +
				"    interpreter = &static_interpreter;\n" +
				"    \n" +
				"    TfLiteStatus allocate_status = interpreter->AllocateTensors();\n" +
				"    if (allocate_status != kTfLiteOk) {\n" +
				'        Serial.printf("ERROR: AllocateTensors() failed with status: %d\\n", allocate_status);\n' +
				'        Serial.printf("Free heap after failed allocation: %d bytes\\n", ESP.getFreeHeap());\n' +
				"        return false;\n" +
				"    }\n" +
				"    input = interpreter->input(0);\n" +
				"    output = interpreter->output(0);\n" +
				"    \n" +
				"    return true;\n" +
				"}",
		);

		arduino.addSetup("tensorflow", "setupTensorFlow();\n");
	}

	arduino.forBlock.ml_classify = (block) => {
		if (ml.generateInference) {
			addTensorFlowDetails();

			return `${ml
				.getSensors()
				.map((sensor, index) =>
					sensor.type.getValues(
						arduino,
						(node, value) => `input->data.f[${index + node}] = ${value};\n`,
						sensor.settings,
					),
				)
				.join("")}interpreter->Invoke();\n\n${ml
				.getClasses()
				.map(
					(classData, index) =>
						`float ${getClassName(classData)}_prob = output->data.f[${index}];\n`,
				)
				.join("")}\nint predicted_class = 0;\nfloat max_prob = 0;\n\n${ml
				.getClasses()
				.map(
					(classData, index) =>
						`if (${getClassName(classData)}_prob > max_prob) {\n  predicted_class = ${index};\n  max_prob = ${getClassName(classData)}_prob;\n}\n`,
				)
				.join("")}`;
		}

		addBluetoothDetails();

		return `delay(10);\nBLE.poll();\n${ml
			.getSensors()
			.map((sensor, index) =>
				sensor.type.getValues(
					arduino,
					(_node, value) => `inputBuffer[${index}] = ${value};\n`,
					sensor.settings,
				),
			)
			.join(
				"",
			)}\ninput.writeValue(inputBuffer, ${ml.getSensors().length * 4});\n`;
	};

	arduino.forBlock.ml_certainty = (block) => {
		const classIndex = ml.getClassIndex(block.getFieldValue("CLASS"));
		if (ml.generateInference) {
			return [`(predicted_class == ${classIndex})`, arduino.ORDER_ATOMIC];
		}

		return [`outputBuffer[${classIndex}]`, arduino.ORDER_ATOMIC];
	};
}

export default getCodeGenerators;
