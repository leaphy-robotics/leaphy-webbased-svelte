import type {Arduino} from "../arduino";
import {Dependencies} from "./dependencies";
import {Class, ml, SensorData, SensorReference} from "../../categories/ml";

function getClassName(classData: Class) {
	return `class_${classData.name.replaceAll(" ", "_")}`
}

function getSensorName(sensor: SensorData) {
	return `sensor_${sensor.type.type}_${sensor.id.replaceAll('-', '_')}`
}

function getCodeGenerators(arduino: Arduino) {
	function addBluetoothDetails() {
		arduino.addDependency(Dependencies.ARDUINO_BLE)
		arduino.addInclude("bluetooth", "#include <ArduinoBLE.h>")
		arduino.addDefinition(
			"bluetooth",
			'BLEService controlService("071bbd8f-5002-440f-b2e5-bee56f630d2b");\n' +
			ml.getSensors().map(sensor => `BLEFloatCharacteristic ${getSensorName(sensor)}("${sensor.id}", BLERead | BLENotify);\n`).join('') +
			ml.getClasses().map(classData => `BLEBooleanCharacteristic ${getClassName(classData)}("${classData.id}", BLEWrite);\n`).join('')
		)

		arduino.addSetup(
			"bluetooth",
			'BLE.begin();\n' +
			'  BLE.setLocalName("Leaphy Starling AI");\n' +
			'  BLE.setAdvertisedService(controlService);\n' +
			ml.getSensors().map(sensor => `  controlService.addCharacteristic(${getSensorName(sensor)});\n`).join('') +
			ml.getClasses().map(classData => `  controlService.addCharacteristic(${getClassName(classData)});\n`).join('') +
			'  BLE.addService(controlService);\n' +
			'  BLE.advertise();'
		)
	}

	function addTensorFlowDetails() {
		arduino.addDependency(Dependencies.TENSORFLOW_ESP32)
		arduino.addInclude('tensorflow', '#include <TensorFlowLite_ESP32.h>\n' +
			'#include "tensorflow/lite/micro/all_ops_resolver.h"\n' +
			'#include "tensorflow/lite/micro/micro_error_reporter.h"\n' +
			'#include "tensorflow/lite/micro/micro_interpreter.h"\n' +
			'#include "tensorflow/lite/schema/schema_generated.h"')

		arduino.addDefinition("tensorflow_model", ml.modelHeaders || '')

		arduino.addDefinition('tensorflow', 'tflite::ErrorReporter* error_reporter = nullptr;\n' +
			'const tflite::Model* model = nullptr;\n' +
			'tflite::MicroInterpreter* interpreter = nullptr;\n' +
			'TfLiteTensor* input = nullptr;\n' +
			'TfLiteTensor* output = nullptr;\n' +
			'constexpr int kTensorArenaSize = 250 * 1024;\n' +
			'uint8_t tensor_arena[kTensorArenaSize];')

		arduino.addDeclaration('tensorflow', 'bool setupTensorFlow() {\n' +
			'    static tflite::MicroErrorReporter micro_error_reporter;\n' +
			'    error_reporter = &micro_error_reporter;\n' +
			'    \n' +
			'    // Map the model into a usable data structure\n' +
			'    model = tflite::GetModel(model_data);\n' +
			'    if (model == nullptr) {\n' +
			'        Serial.println("ERROR: Failed to load model!");\n' +
			'        return false;\n' +
			'    }\n' +
			'    \n' +
			'    if (model->version() != TFLITE_SCHEMA_VERSION) {\n' +
			'        Serial.printf("ERROR: Model schema version mismatch! Model: %d, Expected: %d\\n",\n' +
			'                      model->version(), TFLITE_SCHEMA_VERSION);\n' +
			'        return false;\n' +
			'    }\n' +
			'    Serial.println("Schema version OK");\n' +
			'    \n' +
			'    static tflite::AllOpsResolver resolver;\n' +
			'    \n' +
			'    static tflite::MicroInterpreter static_interpreter(\n' +
			'        model, resolver, tensor_arena, kTensorArenaSize, error_reporter);\n' +
			'    interpreter = &static_interpreter;\n' +
			'    \n' +
			'    TfLiteStatus allocate_status = interpreter->AllocateTensors();\n' +
			'    if (allocate_status != kTfLiteOk) {\n' +
			'        Serial.printf("ERROR: AllocateTensors() failed with status: %d\\n", allocate_status);\n' +
			'        Serial.printf("Free heap after failed allocation: %d bytes\\n", ESP.getFreeHeap());\n' +
			'        return false;\n' +
			'    }\n' +
			'    input = interpreter->input(0);\n' +
			'    output = interpreter->output(0);\n' +
			'    \n' +
			'    return true;\n' +
			'}')

		arduino.addSetup("tensorflow", "setupTensorFlow();\n")
	}

	arduino.forBlock.ml_classify = (block) => {
		if (ml.generateInference) {
			addTensorFlowDetails()

			return ml.getSensors().map((sensor, index) => (
					sensor.type.getValues(
						arduino,
						(node, value) => `input->data.f[${index + node}] = ${value};\n`,
						sensor.settings
					)
				)).join('') +
				'interpreter->Invoke();\n\n' +
				ml.getClasses().map((classData, index) => `float ${getClassName(classData)}_prob = output->data.f[${index}];\n`).join('') +
				'\n' +
				'int predicted_class = 0;\n' +
				'float max_prob = 0;\n\n' +
				ml.getClasses().map((classData, index) =>
					`if (${getClassName(classData)}_prob > max_prob) {\n` +
					`  predicted_class = ${index};\n` +
					`  max_prob = ${getClassName(classData)}_prob;\n` +
					'}\n'
				).join('')
		} else {
			addBluetoothDetails();

			return 'BLE.poll();\n' +
				'delay(10);\n' +
				ml.getSensors().map(sensor => (
					sensor.type.getValues(
						arduino,
						(_node, value) => `${getSensorName(sensor)}.writeValue(${value});\n`,
						sensor.settings
					)
				)).join('')
		}
	}

	arduino.forBlock.ml_certainty = function (block) {
		const classData = ml.getClass(block.getFieldValue("CLASS"));
		if (ml.generateInference) {
			return [`(predicted_class == ${ml.getClasses().indexOf(classData)})`, arduino.ORDER_ATOMIC]
		} else {
			return [`${getClassName(classData)}.value()`, arduino.ORDER_ATOMIC];
		}
	}
}

export default getCodeGenerators;
