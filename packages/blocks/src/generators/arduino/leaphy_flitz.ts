import type { Arduino } from "../arduino";

function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.leaphy_flitz_read_stomach_sensor = (block) => {
		const sensorType = block.getFieldValue("SENSOR_TYPE");

		let code = "";
		let setup = "";
		if (sensorType === "1") {
			setup =
				"pinMode(8, OUTPUT);\n  pinMode(9, OUTPUT);\n  pinMode(10, INPUT);\n  digitalWrite(8, LOW);\n  digitalWrite(9, HIGH);\n";
			code = "digitalRead(10)";
		} else if (sensorType === "2") {
			setup =
				"pinMode(8, INPUT);\n  pinMode(9, OUTPUT);\n  pinMode(10, OUTPUT);\n  digitalWrite(8, LOW);\n  digitalWrite(9, HIGH);\n";
			code = "digitalRead(8)";
		}
		arduino.addSetup("setup_flitz_stomach", setup, false);
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_flitz_nano_read_stomach_sensor = () => {
		const setup = "pinMode(2, INPUT);";
		const code = "digitalRead(2)";
		arduino.addSetup("setup_flitz_stomach", setup, false);
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_flitz_read_hand_sensor = () => {
		arduino.addSetup(
			"setup_flitz_hand",
			"pinMode(14, OUTPUT);\n pinMode(15, OUTPUT);\n pinMode(2, INPUT);\n digitalWrite(14, HIGH);\n digitalWrite(15, LOW);\n",
			false,
		);
		const code = "analogRead(2)";
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_flitz_nano_read_hand_sensor = () => {
		arduino.addSetup("setup_flitz_hand", "pinMode(A0, INPUT);", false);
		const code = "analogRead(A0)";
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_flitz_led = (block) => {
		const flitz_red =
			arduino.valueToCode(block, "FLITZ_LED_R", arduino.ORDER_ATOMIC) || "0";
		const flitz_green =
			arduino.valueToCode(block, "FLITZ_LED_G", arduino.ORDER_ATOMIC) || "0";
		const flitz_blue =
			arduino.valueToCode(block, "FLITZ_LED_B", arduino.ORDER_ATOMIC) || "0";

		let code: string;
		if (arduino.boardType.includes("nano")) {
			// Ground is connected to pin 8 on the nano, so it needs to be pulled LOW
			arduino.addSetup(
				"setup_flitz_nano_rgb",
				"pinMode(8, OUTPUT);\n  digitalWrite(8, LOW);",
				false,
			);
			code =
				`analogWrite(11, ${flitz_red});\n` +
				`analogWrite(10, ${flitz_green});\n` +
				`analogWrite(9, ${flitz_blue});\n`;
		} else {
			code =
				`analogWrite(3, ${flitz_red});\n` +
				`analogWrite(5, ${flitz_green});\n` +
				`analogWrite(6, ${flitz_blue});\n`;
		}

		return code;
	};
}

export default getCodeGenerators;
