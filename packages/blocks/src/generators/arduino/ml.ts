import type {Arduino} from "../arduino";
import {Dependencies} from "./dependencies";
import {getTOF} from "./arduino";
import {Class, ml} from "../../categories/ml";

function getClassName(classData: Class) {
	return `class${classData.name.replaceAll(" ", "_")}`
}

function getCodeGenerators(arduino: Arduino) {
	function addBluetoothDetails() {
		arduino.addDependency(Dependencies.ARDUINO_BLE)
		arduino.addInclude("bluetooth", "#include <ArduinoBLE.h>")
		arduino.addDefinition(
			"bluetooth",
			'BLEService controlService("071bbd8f-5002-440f-b2e5-bee56f630d2b");\n' +
			'BLEByteCharacteristic leftDistanceChar("fae2ac9b-9da5-4cb3-ab1f-66e31e2908f7", BLERead | BLENotify);\n' +
			'BLEByteCharacteristic rightDistanceChar("6818778d-e2bb-4828-80f0-8ad9cdbce4ab", BLERead | BLENotify);\n' +
			ml.getClasses().map(classData => `BLEBooleanCharacteristic ${getClassName(classData)}("${classData.id}", BLEWrite);\n`).join('')
		)

		arduino.addSetup(
			"bluetooth",
			'BLE.begin();\n' +
			'  BLE.setLocalName("Leaphy Starling AI");\n' +
			'  BLE.setAdvertisedService(controlService);\n' +
			'  controlService.addCharacteristic(leftDistanceChar);\n' +
			'  controlService.addCharacteristic(rightDistanceChar);\n' +
			ml.getClasses().map(classData => `controlService.addCharacteristic(${getClassName(classData)});\n`).join('') +
			'  BLE.addService(controlService);\n' +
			'  BLE.advertise();'
		)
	}

	arduino.forBlock.ml_classify = (block) => {
		addBluetoothDetails();

		const innerCode = arduino.statementToCode(block, "DO");

		return 'while (true) {\n' +
			'  BLEDevice central = BLE.central();\n' +
			'  if (!central) continue;\n\n' +
			'  while (central.connected()) {\n' +
			'    i2cSelectChannel(0);\n' +
			`    leftDistanceChar.writeValue(min(255, ${getTOF(arduino)} / 10));\n` +
			'    i2cRestoreChannel();\n' +
			'    i2cSelectChannel(7);\n' +
			`    rightDistanceChar.writeValue(min(255, ${getTOF(arduino)} / 10));\n` +
			'    i2cRestoreChannel();\n' +
			innerCode.split('\n').map(e => `  ${e}`).join('\n').trimEnd() +
			'\n  }\n' +
			'}\n'
	}

	arduino.forBlock.ml_certainty = function (block) {
		const classData = ml.getClass(block.getFieldValue("CLASS"));
		console.log(classData, block.getFieldValue("CLASS"));

		return [`${getClassName(classData)}.value()`, arduino.ORDER_ATOMIC];
	}
}

export default getCodeGenerators;
