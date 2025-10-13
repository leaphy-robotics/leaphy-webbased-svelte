// Encode a string into a UUID-like format
import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";

// UUID used to identify Leaphy's control service
export const SERVICE_UUID = "33c7afab-1609-4a7e-861d-9cfbefb33541";

export function encodeStringToUUID(str: string) {
	// Convert string to hex
	const hex = str
		.split("")
		.map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
		.join("");

	// Pad or truncate to fit UUID format (32 hex chars needed)
	const paddedHex = hex.padEnd(32, "0").substring(0, 32);

	// Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
	return [
		paddedHex.substring(0, 8),
		paddedHex.substring(8, 12),
		paddedHex.substring(12, 16),
		paddedHex.substring(16, 20),
		paddedHex.substring(20, 32),
	].join("-");
}

// Decode a UUID back to the original string
export function decodeUUIDToString(uuid: string) {
	// Remove dashes to get the hex data
	const hex = uuid.replace(/-/g, "");

	// Convert hex back to string
	return hex
		.split(/(\w\w)/g)
		.filter((p) => p)
		.map((c) => String.fromCharCode(Number.parseInt(c, 16)))
		.join("")
		.replace(/\0+$/, "");
}

function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.ble_setup = (block) => {
		arduino.addDependency(Dependencies.ARDUINO_BLE);
		arduino.addInclude("bluetooth", "#include <ArduinoBLE.h>");

		const keys = Array.from(
			new Set(
				block.workspace
					.getBlocksByType("ble_is_pressed")
					.map((block) => block.getFieldValue("KEY") as string),
			).values(),
		);

		arduino.addDefinition(
			"BLE",
			`BLEService controlService("${SERVICE_UUID}");\n\n${keys
				.map(
					(key) =>
						`BLEByteCharacteristic ${key}Characteristic("${encodeStringToUUID(key)}", BLEWrite);`,
				)
				.join("\n")}`,
		);

		const name = arduino.valueToCode(block, "NAME", arduino.ORDER_NONE);
		return `if (!BLE.begin()) {\n  Serial.println("starting Bluetooth® Low Energy module failed!");\n\n  while (1);\n}\n\nBLE.setLocalName(${name});\nBLE.setAdvertisedService(controlService);\n\n${keys
			.map((key) => `controlService.addCharacteristic(${key}Characteristic);`)
			.join("\n")}\nBLE.addService(controlService);\n\nBLE.advertise();\n`;
	};

	arduino.forBlock.ble_update = () => {
		arduino.addDependency(Dependencies.ARDUINO_BLE);
		arduino.addInclude("bluetooth", "#include <ArduinoBLE.h>");

		return "BLE.poll();\n";
	};

	arduino.forBlock.ble_is_pressed = (block) => {
		arduino.addDependency(Dependencies.ARDUINO_BLE);
		arduino.addInclude("bluetooth", "#include <ArduinoBLE.h>");

		const key = block.getFieldValue("KEY");
		return [`(${key}Characteristic.value() == 1)`, arduino.ORDER_ATOMIC];
	};
}

export default getCodeGenerators;
