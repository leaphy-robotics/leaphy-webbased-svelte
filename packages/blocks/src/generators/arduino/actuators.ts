import { Led } from "@leaphy-robotics/schemas";
import Servo from "@leaphy-robotics/schemas/src/components/servo";
import type { Block } from "blockly/core";
import { COLOR_CHANNELS, COLOR_FORMAT_FIELD } from "../../color";
import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";
import { addI2CDeclarations } from "./i2c";

// Helpers used by the LED strip blocks. They're declared together with the strip itself,
// so NUM_LEDS is always defined before they are.
const LEDSTRIP_HELPERS =
	"int ledstripIndex(long led) {\n" +
	"    long index = led % NUM_LEDS;\n" +
	"    return index < 0 ? index + NUM_LEDS : index;\n" +
	"}\n" +
	"\n" +
	"uint8_t ledstripValue(long value) {\n" +
	"    return value < 0 ? 0 : value > 255 ? 255 : value;\n" +
	"}\n";

function addDisplaySetupCode(arduino: Arduino, large: boolean) {
	const displaySetup = `if (!display.begin(${large ? "0x3C, true" : "SSD1306_SWITCHCAPVCC, 0x3C"})) {\n        Serial.println(F("Contact with the display failed: Check the connections"));\n      }\n\n      display.clearDisplay();\n      display.setTextSize(1);\n      display.setTextColor(${large ? "SH110X_WHITE" : "SSD1306_WHITE"});\n      display.setCursor(0, 0);\n      display.println(F("Leaphy OLED"));\n      display.display();\n`;
	const setup = arduino.addI2CSetup("oled", displaySetup);
	arduino.addDependency(
		large
			? Dependencies.ADAFRUIT_SH110X_OLED
			: Dependencies.ADAFRUIT_SSD1306_OLED,
	);
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
	return setup;
}

function createDisplayGenerators(
	arduino: Arduino,
	prefix: string,
	large: boolean,
) {
	arduino.forBlock[`${prefix}_clear`] = () => {
		const setup = addDisplaySetupCode(arduino, large);
		return `${setup}display.clearDisplay();\n`;
	};
	arduino.forBlock[`${prefix}_set_text_size`] = (block) => {
		const setup = addDisplaySetupCode(arduino, large);
		const size = arduino.valueToCode(block, "NUM", arduino.ORDER_ATOMIC) || "0";
		return `${setup}display.setTextSize(${size});\n`;
	};
	arduino.forBlock[`${prefix}_print_line`] = (block) => {
		const setup = addDisplaySetupCode(arduino, large);
		const value =
			arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
		const cursorHeight = block.getFieldValue("DISPLAY_ROW") * 12;
		return `${setup}display.setCursor(0, ${cursorHeight});\ndisplay.println(${value});\n`;
	};
	arduino.forBlock[`${prefix}_print_value`] = (block) => {
		const setup = addDisplaySetupCode(arduino, large);
		const name =
			arduino.valueToCode(block, "NAME", arduino.ORDER_ATOMIC) || "0";
		const value =
			arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
		const cursorHeight = block.getFieldValue("DISPLAY_ROW") * 12;
		return `${setup}display.setCursor(0, ${cursorHeight});\ndisplay.print(${name});\ndisplay.print(" = ");\ndisplay.println(${value});\n`;
	};
	arduino.forBlock[`${prefix}_display`] = () => {
		const setup = addDisplaySetupCode(arduino, large);
		return `${setup}display.display();\n`;
	};
}

function addLcdSetupCode(arduino: Arduino) {
	const setup = arduino.addI2CSetup(
		"lcd",
		"lcd.begin(16, 2);\n      lcd.setBacklight(255);\n",
	);
	arduino.addDependency(Dependencies.LIQUIDCRYSTAL_PCF8574);
	arduino.addInclude("include_lcd", "#include <LiquidCrystal_PCF8574.h>");
	arduino.addInclude("define_lcd", "LiquidCrystal_PCF8574 lcd(0x27);");
	return setup;
}

function addLcdPrintLine(arduino: Arduino) {
	arduino.addDeclaration(
		"lcd_print_line",
		"void lcdPrintLine(uint8_t row, String value) {\n" +
			"    lcd.setCursor(0, row);\n" +
			"    lcd.print(value);\n" +
			"    for (int i = value.length(); i < 16; i++) lcd.print(' ');\n" +
			"}\n",
	);
}

function addSdCard(arduino: Arduino) {
	arduino.addDependency(Dependencies.SD);
	arduino.addInclude("sdcard", "#include <SD.h>");
	arduino.addSetup("sdcard", "SD.begin(10);");
}

function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.leaphy_io_digitalwrite = (block) => {
		const pin = arduino.getPinMapping(block, "PIN");
		const state =
			arduino.valueToCode(block, "STATE", arduino.ORDER_ATOMIC) || "false";
		if (arduino.builder) {
			// The LED sinks into the pin, so it's powered by the rail and lights up on LOW
			const led = arduino.builder.add(`led-${pin}`, Led);
			arduino.builder.connectCable(
				[arduino.builder.murphy.port(pin), led.port("GND")],
				[arduino.builder.murphy.port(`${pin}.3V3`), led.port("VCC")],
			);
		}
		arduino.reservePin(block, pin, arduino.PinTypes.OUTPUT, "Digital Write");
		arduino.addSetup(`io_${pin}`, `pinMode(${pin}, OUTPUT);`, false);
		const debug = arduino.createDebug(`digital-output-${pin}`, {
			type: "basic",
			name: `Digital output ${pin}`,
			values: 1,
		});
		return `digitalWrite(${pin}, ${debug(state)});\n`;
	};

	arduino.forBlock.leaphy_io_analogwrite = (block) => {
		const pin = arduino.getPinMapping(block, "PIN");
		const value =
			arduino.valueToCode(block, "NUM", arduino.ORDER_ATOMIC) || "0";
		arduino.reservePin(block, pin, arduino.PinTypes.OUTPUT, "Analogue Write");
		arduino.addSetup(`io_${pin}`, `pinMode(${pin}, OUTPUT);`, false);
		if (Number(value) < 0 || Number(value) > 255) {
			block.setWarningText(
				"The analogue value set must be between 0 and 255",
				"pwm_value",
			);
		} else {
			block.setWarningText(null);
		}
		const debug = arduino.createDebug(`pwm-output-${pin}`, {
			type: "basic",
			name: `PWM ${pin}`,
			values: 1,
		});
		return `analogWrite(${pin}, ${debug(value)});\n`;
	};

	arduino.forBlock.leaphy_serial_print_line = (block) => {
		const value =
			arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
		return `Serial.println(${value});\n`;
	};

	arduino.forBlock.leaphy_serial_print_value = (block) => {
		const name =
			arduino.valueToCode(block, "NAME", arduino.ORDER_ATOMIC) || "0";
		const value =
			arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
		return `Serial.print(${name});\nSerial.print(" = ");\nSerial.println(${value});\n`;
	};

	arduino.forBlock.leaphy_servo_write = (block) => {
		const pin = arduino.getPinMapping(block, "SERVO_PIN");
		const angle =
			arduino.valueToCode(block, "SERVO_ANGLE", arduino.ORDER_ATOMIC) || "90";
		const servoName = `myServo${pin}`;
		if (arduino.builder) {
			const servo = arduino.builder.add(`servo-${pin}`, Servo);
			arduino.builder.connectCable(
				[arduino.builder.murphy.port(pin), servo.port("pulse")],
				[arduino.builder.murphy.port(`${pin}.3V3`), servo.port("vcc")],
				[arduino.builder.murphy.port(`${pin}.GND`), servo.port("gnd")],
			);
		}
		arduino.reservePin(block, pin, arduino.PinTypes.SERVO, "Servo Write");
		arduino.includeServoHeader();
		arduino.addDeclaration(`servo_${pin}`, `Servo ${servoName};`);
		arduino.addSetup(`servo_${pin}`, `${servoName}.attach(${pin});`, true);
		const debug = arduino.createDebug(`servo-${pin}`, {
			type: "servo",
			name: `Servo ${pin}`,
			values: 1,
		});
		return `${servoName}.write(${debug(angle)});\n`;
	};

	arduino.forBlock.leaphy_multiplexer_digitalwrite = (block) => {
		const pin = block.getFieldValue("PIN");
		arduino.addSetup(
			"dgmulti",
			"pinMode(0, OUTPUT);\n  pinMode(16, OUTPUT);\n  pinMode(1, OUTPUT);\n",
			false,
		);
		return `digitalWrite(0, bitRead(${pin}, 2));\ndigitalWrite(16, bitRead(${pin}, 1));\ndigitalWrite(1, bitRead(${pin}, 0));\n`;
	};

	arduino.forBlock.leaphy_led_strip_setup = (block) => {
		const pin = arduino.getPinMapping(block, "PIN");
		const leds =
			arduino.valueToCode(block, "LEDS", arduino.ORDER_ATOMIC) || "0";

		arduino.addDependency(Dependencies.FASTLED);
		arduino.addInclude("fastled", '#include "FastLED.h"');
		arduino.addDeclaration(
			"ledstrip",
			`#define NUM_LEDS ${leds}\nCRGB ledstrip[NUM_LEDS];\n\n${LEDSTRIP_HELPERS}`,
		);
		arduino.addSetup(
			"ledstrip",
			`FastLED.addLeds<WS2812, ${pin}, GRB>(ledstrip, NUM_LEDS);`,
		);

		arduino.reservePin(block, pin, arduino.PinTypes.LEDSTRIP, "Led Strip");
		return "";
	};

	const value = (block: Block, input: string) =>
		arduino.valueToCode(block, input, arduino.ORDER_NONE) || "0";
	const color = (block: Block) => {
		const [first, second, third] = COLOR_CHANNELS.map((name) =>
			value(block, name),
		);
		// The hue wraps around (256 is red again), the other values are limited to 0-255
		return block.getFieldValue(COLOR_FORMAT_FIELD) === "HSV"
			? `CHSV((uint8_t)(long)(${first}), ledstripValue(${second}), ledstripValue(${third}))`
			: `CRGB(ledstripValue(${first}), ledstripValue(${second}), ledstripValue(${third}))`;
	};

	arduino.forBlock.leaphy_led_strip_set_led = (block) => {
		return `ledstrip[ledstripIndex(${value(block, "LED")})] = ${color(block)};\n`;
	};

	arduino.forBlock.leaphy_led_strip_fill = (block) => {
		return `fill_solid(ledstrip, NUM_LEDS, ${color(block)});\n`;
	};

	arduino.forBlock.leaphy_led_strip_brightness = (block) => {
		return `FastLED.setBrightness(ledstripValue(${value(block, "BRIGHTNESS")}));\n`;
	};

	arduino.forBlock.leaphy_led_strip_show = () => "FastLED.show();\n";

	arduino.forBlock.leaphy_led_strip_count = () => [
		"NUM_LEDS",
		arduino.ORDER_ATOMIC,
	];

	createDisplayGenerators(arduino, "leaphy_display", false);

	createDisplayGenerators(arduino, "leaphy_display_large", true);

	arduino.forBlock.leaphy_lcd_clear = () => {
		const setup = addLcdSetupCode(arduino);
		return `${setup}lcd.clear();\n`;
	};

	arduino.forBlock.leaphy_lcd_print_line = (block) => {
		const setup = addLcdSetupCode(arduino);
		addLcdPrintLine(arduino);
		const value =
			arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
		const row = block.getFieldValue("DISPLAY_ROW");
		return `${setup}lcdPrintLine(${row}, String(${value}));\n`;
	};

	arduino.forBlock.leaphy_lcd_print_value = (block) => {
		const setup = addLcdSetupCode(arduino);
		addLcdPrintLine(arduino);
		const name =
			arduino.valueToCode(block, "NAME", arduino.ORDER_ATOMIC) || "0";
		const value =
			arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
		const row = block.getFieldValue("DISPLAY_ROW");
		return `${setup}lcdPrintLine(${row}, String(${name}) + " = " + String(${value}));\n`;
	};

	arduino.forBlock.leaphy_lcd_set_backlight = (block) => {
		const setup = addLcdSetupCode(arduino);
		const backlight = block.getFieldValue("BACKLIGHT");
		return `${setup}lcd.setBacklight(${backlight === "ON" ? "255" : "0"});\n`;
	};

	arduino.forBlock.leaphy_matrix_init = (block) => {
		const din = arduino.getPinMapping(block, "DIN");
		const clk = arduino.getPinMapping(block, "CLK");
		const cs = arduino.getPinMapping(block, "CS");
		arduino.addDependency(Dependencies.LEAPHY_EXTENSIONS);
		arduino.addInclude("matrix", "#include <LedControl.h>");
		arduino.addDeclaration(
			"matrix",
			`LedControl matrix = LedControl(${din}, ${clk}, ${cs}, 1);`,
		);
		arduino.addSetup(
			"matrix",
			"matrix.shutdown(0, false);\n" +
				"  matrix.setIntensity(0, 8);\n" +
				"  matrix.clearDisplay(0);",
		);
		return "";
	};

	arduino.forBlock.leaphy_matrix_fill = (block) => {
		const matrix = block.getFieldValue("MATRIX");
		return matrix
			.map(
				(row: number[], index: number) =>
					`matrix.setRow(0, ${index}, B${row.join("")});\n`,
			)
			.join("");
	};

	arduino.forBlock.leaphy_matrix_set = (block) => {
		const x = arduino.valueToCode(block, "X", arduino.ORDER_ATOMIC) || "0";
		const y = arduino.valueToCode(block, "Y", arduino.ORDER_ATOMIC) || "0";
		const on = arduino.valueToCode(block, "ON", arduino.ORDER_ATOMIC) || "0";
		return `matrix.setLed(0, ${y}, ${x}, ${on});\n`;
	};

	arduino.forBlock.leaphy_matrix_set_brightness = (block) => {
		const brightness =
			arduino.valueToCode(block, "BRIGHTNESS", arduino.ORDER_ATOMIC) || "0";
		return `matrix.setIntensity(0, ${brightness}/100*16);\n`;
	};

	arduino.forBlock.leaphy_matrix_clear = () => "matrix.clearDisplay(0);\n";

	arduino.forBlock.leaphy_segment_init = (block) => {
		const clk = arduino.getPinMapping(block, "CLK");
		const dio = arduino.getPinMapping(block, "DIO");
		arduino.addDependency(Dependencies.LEAPHY_EXTENSIONS);
		arduino.addInclude("tm1637", "#include <SegmentDisplay.h>");
		arduino.addDeclaration(
			"segment",
			`TM1637Display segment_display(${clk}, ${dio});`,
		);
		arduino.addSetup("segment", "segment_display.setBrightness(255);\n", false);
		return "";
	};

	arduino.forBlock.leaphy_segment_set = (block) => {
		const number =
			arduino.valueToCode(block, "NUM", arduino.ORDER_ATOMIC) || "0";
		return `segment_display.showNumberDec(${number});\n`;
	};

	arduino.forBlock.leaphy_segment_clear = () => "segment_display.clear();\n";

	arduino.forBlock.leaphy_segment_set_brightness = (block) => {
		const brightness =
			arduino.valueToCode(block, "BRIGHTNESS", arduino.ORDER_ATOMIC) || "0";
		return `segment_display.setBrightness(${brightness}/100*255);\n`;
	};

	arduino.forBlock.leaphy_sound_init = (block) => {
		const rx = arduino.getPinMapping(block, "RX");
		const tx = arduino.getPinMapping(block, "TX");
		arduino.addDependency(Dependencies.LEAPHY_EXTENSIONS);
		arduino.addInclude("sound", "#include <RedMP3.h>");
		arduino.addDeclaration("sound", `MP3 mp3(${rx}, ${tx});`);
		return "";
	};

	arduino.forBlock.leaphy_sound_play = (block) => {
		const item =
			arduino.valueToCode(block, "ITEM", arduino.ORDER_ATOMIC) || "0";
		return `mp3.playWithIndex(${item});\n`;
	};

	arduino.forBlock.leaphy_sound_set_volume = (block) => {
		const volume =
			arduino.valueToCode(block, "VOLUME", arduino.ORDER_ATOMIC) || "0";
		return `mp3.setVolume(${volume}/100.0*30.0);\n`;
	};

	arduino.forBlock.leaphy_sound_stop = () => "mp3.stopPlay();\n";

	arduino.forBlock.i2c_list_devices = () => {
		const listDevices =
			"void i2cListDevices() {\n" +
			"    for (int channel = 0; channel < 8; channel++) {\n" +
			'        Serial.print("Scanning channel ");\n' +
			"        Serial.print(channel);\n" +
			'        Serial.println(":");\n' +
			"        i2cSelectChannel(channel);\n" +
			"        for (DeviceAddress address : deviceMap) {\n" +
			"            Wire.beginTransmission(address.address);\n" +
			"            int error = Wire.endTransmission();\n" +
			"            if (error == 0) {\n" +
			'                Serial.print("Found: ");\n' +
			"                Serial.print(address.device);\n" +
			'                Serial.print(" at address 0x");\n' +
			'                if (address.address < 16) Serial.print("0");\n' +
			"                Serial.println(address.address, HEX);\n" +
			"            }\n" +
			"        }\n" +
			"        i2cRestoreChannel();\n" +
			"    }\n" +
			"}\n";
		const deviceMap =
			"struct DeviceAddress { uint8_t address; char* device; };\n" +
			"DeviceAddress deviceMap[] = {\n" +
			'    {0x0D, "Compass"},\n' +
			'    {0x29, "Color Sensor / ToF Sensor"},\n' +
			'    {0x39, "RGB + Gesture Sensor"},\n' +
			'    {0x3C, "Screen"},\n' +
			'    {0x48, "TMP102 Temperature Sensor"},\n' +
			'    {0x58, "Gas Sensor"},\n' +
			'    {0x76, "Air Pressure Sensor"}\n' +
			"};\n";
		addI2CDeclarations();
		arduino.addInclude("i2c_device_map", deviceMap);
		arduino.addDeclaration("i2c_list_devices", listDevices);
		return "i2cListDevices();\n";
	};

	arduino.forBlock.leaphy_sdcard_write = (block) => {
		const filename =
			arduino.valueToCode(block, "FILENAME", arduino.ORDER_ATOMIC) || '""';
		const value =
			arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || '""';
		addSdCard(arduino);
		return `if (File sdFile = SD.open(${filename}, FILE_WRITE)) {\n  sdFile.println(${value});\n  sdFile.close();\n} else {\n  Serial.println("Failed to open SD card!");\n}\n`;
	};

	arduino.forBlock.leaphy_sdcard_remove = (block) => {
		const filename =
			arduino.valueToCode(block, "FILENAME", arduino.ORDER_ATOMIC) || '""';
		addSdCard(arduino);
		return `SD.remove(${filename});\n`;
	};

	arduino.forBlock.leaphy_sdcard_mkdir = (block) => {
		const filename =
			arduino.valueToCode(block, "FILENAME", arduino.ORDER_ATOMIC) || '""';
		addSdCard(arduino);
		return `SD.mkdir(${filename});\n`;
	};
}

export default getCodeGenerators;
