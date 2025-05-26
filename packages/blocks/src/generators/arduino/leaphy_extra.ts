import type { Arduino } from "../arduino";

function getCodeGenerators(arduino: Arduino) {
	function addRGBColorDefinitions() {
		const includeDefinition = '#include "Adafruit_TCS34725.h"';
		const variablesDefinition =
			"Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_24MS, TCS34725_GAIN_16X);\n";
		const rgbColorSetupCode =
			'if (tcs.begin()) {\n    Serial.println("RGB-sensor gevonden!");\n  } else {\n    Serial.println("Geen RGB-sensor gevonden... check je verbindingen...");\n  }\n';
		const rgbColorSetup = arduino.addI2CSetup("rgb_color", rgbColorSetupCode);
		const getColorDefinition = `double getColor(int colorCode, bool isRaw) {\n  ${rgbColorSetup}  uint16_t RawColor_Red, RawColor_Green, RawColor_Blue, RawColor_Clear;\n  byte Color_Red, Color_Green, Color_Blue, Color_Clear;\n  tcs.getRawData(&RawColor_Red, &RawColor_Green, &RawColor_Blue, &RawColor_Clear);\n  Color_Red = min(RawColor_Red/5,255); Color_Green = min(RawColor_Green/5,255); Color_Blue = min(RawColor_Blue/5,255);\n  switch(colorCode) {\n    case 0:\n      return (isRaw) ? RawColor_Red : Color_Red;\n    case 1:\n      return (isRaw) ? RawColor_Green : Color_Green;\n    case 2:\n      return (isRaw) ? RawColor_Blue : Color_Blue;\n  }\n}\n`;
		arduino.addInclude("define_leaphy_rgb", includeDefinition);
		arduino.addInclude("define_leaphy_rgb_var", variablesDefinition);
		arduino.addDeclaration("define_get_color", getColorDefinition);
	}

	arduino.forBlock.leaphy_rgb_color = (block) => {
		addRGBColorDefinitions();
		const colorType = block.getFieldValue("COLOR_TYPE");
		const code = `getColor(${colorType}, false)`;
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_rgb_color_raw = (block) => {
		addRGBColorDefinitions();
		const colorType = block.getFieldValue("COLOR_TYPE_RAW");
		const code = `getColor(${colorType}, true)`;
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_rgb_raw_color_red = () => {
		addRGBColorDefinitions();
		const code = "getColor(0, true)";
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_rgb_raw_color_green = () => {
		addRGBColorDefinitions();
		const code = "getColor(1, true)";
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_rgb_raw_color_blue = () => {
		addRGBColorDefinitions();
		const code = "getColor(2, true)";
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_led_set_strip = (block) => {
		const pin =
			arduino.valueToCode(block, "LED_SET_PIN", arduino.ORDER_ATOMIC) || "0";
		const leds =
			arduino.valueToCode(block, "LED_SET_LEDS", arduino.ORDER_ATOMIC) || "0";

		arduino.addInclude("led_libs", '#include "ledstrip.h"');
		arduino.addDeclaration("leds_pins", `LEDSTRIP ledstrip(${pin}, ${leds});`);

		arduino.reservePin(block, pin, arduino.PinTypes.LEDSTRIP, "Led Strip");
		return "";
	};

	arduino.forBlock.leaphy_led_set_basic = (block) => {
		const led =
			arduino.valueToCode(block, "LED_SET_LED", arduino.ORDER_ATOMIC) || "0";
		const red =
			arduino.valueToCode(block, "LED_BASIC_RED", arduino.ORDER_ATOMIC) || "0";
		const green =
			arduino.valueToCode(block, "LED_BASIC_GREEN", arduino.ORDER_ATOMIC) ||
			"0";
		const blue =
			arduino.valueToCode(block, "LED_BASIC_BLUE", arduino.ORDER_ATOMIC) || "0";
		return `ledstrip.basis(${led}, ${red}, ${green}, ${blue});\n`;
	};

	arduino.forBlock.leaphy_led_set_speed = (block) => {
		const speedValue =
			arduino.valueToCode(block, "LED_SET_SPEEDVALUE", arduino.ORDER_ATOMIC) ||
			"0";
		return `_snelHeid = ${speedValue}`;
	};

	arduino.forBlock.leaphy_led_strip_demo = (block) => {
		const dropdownType = block.getFieldValue("DEMO_TYPE");
		const red =
			arduino.valueToCode(block, "LED_STRIP_DEMO_RED", arduino.ORDER_ATOMIC) ||
			"0";
		const green =
			arduino.valueToCode(
				block,
				"LED_STRIP_DEMO_GREEN",
				arduino.ORDER_ATOMIC,
			) || "0";
		const blue =
			arduino.valueToCode(block, "LED_STRIP_DEMO_BLUE", arduino.ORDER_ATOMIC) ||
			"0";
		return `ledstrip.runFunction(${dropdownType}, ${red}, ${green}, ${blue});\n`;
	};

	arduino.forBlock.leaphy_servo_write = (block) => {
		const pinKey = block.getFieldValue("SERVO_PIN");
		const servoAngle =
			arduino.valueToCode(block, "SERVO_ANGLE", arduino.ORDER_ATOMIC) || "90";
		const servoName = `myServo${pinKey}`;

		arduino.reservePin(block, pinKey, arduino.PinTypes.SERVO, "Servo Write");

		arduino.includeServoHeader();
		arduino.addDeclaration(`servo_${pinKey}`, `Servo ${servoName};`);

		const setupCode = `${servoName}.attach(${pinKey});`;
		arduino.addSetup(`servo_${pinKey}`, setupCode, true);

		return `${servoName}.write(${servoAngle});\n`;
	};

	arduino.forBlock.leaphy_servo_read = (block) => {
		const pinKey = block.getFieldValue("SERVO_PIN");
		const servoName = `myServo${pinKey}`;

		arduino.reservePin(block, pinKey, arduino.PinTypes.SERVO, "Servo Read");

		arduino.includeServoHeader();
		arduino.addDeclaration(`servo_${pinKey}`, `Servo ${servoName};`);

		const setupCode = `${servoName}.attach(${pinKey});`;
		arduino.addSetup(`servo_${pinKey}`, setupCode, true);

		const code = `${servoName}.read()`;
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_io_digitalwrite = (block) => {
		const pin = block.getFieldValue("PIN");
		const stateOutput =
			arduino.valueToCode(block, "STATE", arduino.ORDER_ATOMIC) || "false";

		arduino.reservePin(block, pin, arduino.PinTypes.OUTPUT, "Digital Write");

		const pinSetupCode = `pinMode(${pin}, OUTPUT);`;
		arduino.addSetup(`io_${pin}`, pinSetupCode, false);

		return `digitalWrite(${pin}, ${stateOutput});\n`;
	};

	arduino.forBlock.leaphy_io_analogwrite = (block) => {
		const pin = block.getFieldValue("PIN");
		const stateOutput =
			arduino.valueToCode(block, "NUM", arduino.ORDER_ATOMIC) || "0";

		arduino.reservePin(block, pin, arduino.PinTypes.OUTPUT, "Analogue Write");

		const pinSetupCode = `pinMode(${pin}, OUTPUT);`;
		arduino.addSetup(`io_${pin}`, pinSetupCode, false);

		// Warn if the input value is out of range
		if (Number(stateOutput) < 0 || Number(stateOutput) > 255) {
			block.setWarningText(
				"The analogue value set must be between 0 and 255",
				"pwm_value",
			);
		} else {
			block.setWarningText(null);
		}

		return `analogWrite(${pin}, ${stateOutput});\n`;
	};

	arduino.forBlock.leaphy_multiplexer_digitalwrite = (block) => {
		const pin = block.getFieldValue("PIN");

		const pinSetupCode =
			"pinMode(0, OUTPUT);\n" +
			"  pinMode(16, OUTPUT);\n" +
			"  pinMode(1, OUTPUT);\n";
		arduino.addSetup("dgmulti", pinSetupCode, false);

		return (
			`digitalWrite(0, bitRead(${pin}, 2));\n` +
			`digitalWrite(16, bitRead(${pin}, 1));\n` +
			`digitalWrite(1, bitRead(${pin}, 0));\n`
		);
	};

	arduino.forBlock.leaphy_sonar_read = (block) => {
		arduino.addInclude("leaphy_extra", '#include "Leaphy_Extra.h"');
		const trigPin = block.getFieldValue("TRIG_PIN");
		const echoPin = block.getFieldValue("ECHO_PIN");
		const code = `getDistanceSonar(${trigPin}, ${echoPin})`;
		return [code, arduino.ORDER_ATOMIC];
	};

	const addDisplaySetupCode = (large: boolean) => {
		const displaySetup = `if (!display.begin(${large ? "0x3C, true" : "SSD1306_SWITCHCAPVCC, 0x3C"})) {\n        Serial.println(F("Contact with the display failed: Check the connections"));\n      }\n\n      display.clearDisplay();\n      display.setTextSize(1);\n      display.setTextColor(${large ? "SH110X_WHITE" : "SSD1306_WHITE"});\n      display.setCursor(0, 0);\n      display.println(F("Leaphy OLED"));\n      display.display();\n`;

		const setup = arduino.addI2CSetup("oled", displaySetup);

		arduino.addInclude(
			"include_display",
			large ? "#include <Adafruit_SH110X.h>" : "#include <Adafruit_SSD1306.h>",
		);
		arduino.addInclude(
			"define_display",
			large
				? "Adafruit_SH1106G display(128, 64, &Wire, -1);"
				: "Adafruit_SSD1306 display(128, 32, &Wire, -1);",
		);
		arduino.addSetup("serial", "Serial.begin(115200);");
		return setup;
	};

	function createDisplayBlocks(prefix: string, large: boolean) {
		arduino.forBlock[`${prefix}_clear`] = () => {
			const setup = addDisplaySetupCode(large);
			return `${setup}display.clearDisplay();\n`;
		};

		arduino.forBlock[`${prefix}_set_text_size`] = (block) => {
			const setup = addDisplaySetupCode(large);

			const stateOutput =
				arduino.valueToCode(block, "NUM", arduino.ORDER_ATOMIC) || "0";
			return `${setup}display.setTextSize(${stateOutput});\n`;
		};

		arduino.forBlock[`${prefix}_print_line`] = (block) => {
			const setup = addDisplaySetupCode(large);

			const value =
				arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
			const row = block.getFieldValue("DISPLAY_ROW");
			const cursorHeight = row * 12;
			return `${setup}display.setCursor(0, ${cursorHeight});\ndisplay.println(${value});\n`;
		};

		arduino.forBlock[`${prefix}_print_value`] = (block) => {
			const setup = addDisplaySetupCode(large);

			const name =
				arduino.valueToCode(block, "NAME", arduino.ORDER_ATOMIC) || "0";
			const value =
				arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
			const row = block.getFieldValue("DISPLAY_ROW");
			const cursorHeight = row * 12;
			return `${setup}display.setCursor(0, ${cursorHeight});\ndisplay.print(${name});\ndisplay.print(" = ");\ndisplay.println(${value});\n`;
		};

		arduino.forBlock[`${prefix}_display`] = () => {
			const setup = addDisplaySetupCode(large);
			return `${setup}display.display();\n`;
		};
	}

	createDisplayBlocks("leaphy_display", false);
	createDisplayBlocks("leaphy_display_large", true);
}

export default getCodeGenerators;
