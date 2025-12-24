import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";

const LEDSTRIP_BREATHE =
	"void ledstripBreathe(uint8_t r, uint8_t g, uint8_t b) {\n" +
	"    int delay = map(LEDSTRIP_SPEED, 0, 100, 20, 0);\n" +
	"    fill_solid(ledstrip, NUM_LEDS, CRGB(r, g, b));\n" +
	"    for (int brightness = 1; brightness <= 255; brightness++) {\n" +
	"        FastLED.setBrightness(brightness);\n" +
	"        FastLED.show();\n" +
	"        FastLED.delay(delay);\n" +
	"    }\n" +
	"    for (int brightness = 255; brightness >= 1; brightness--) {\n" +
	"        FastLED.setBrightness(brightness);\n" +
	"        FastLED.show();\n" +
	"        FastLED.delay(delay);\n" +
	"    }\n" +
	"}\n";

const LEDSTRIP_RAINBOW =
	"void ledstripRainbow() {\n" +
	"    int delay = map(LEDSTRIP_SPEED, 0, 100, 20, 0);\n" +
	"    FastLED.setBrightness(255);\n" +
	"    for (int hue = 0; hue <= 255; hue++) {\n" +
	"        fill_rainbow(ledstrip, NUM_LEDS, hue, 255 / NUM_LEDS);\n" +
	"        FastLED.show();\n" +
	"        FastLED.delay(delay);\n" +
	"    }\n" +
	"}\n";

const LEDSTRIP_WAVE =
	"void ledstripWave(uint8_t r, uint8_t g, uint8_t b) {\n" +
	"    int delay = map(LEDSTRIP_SPEED, 0, 100, 200, 20);\n" +
	"    uint8_t startIndex = 0;\n" +
	"    FastLED.setBrightness(255);\n" +
	"    for (int times = 0; times < NUM_LEDS * 4; times++) {\n" +
	"        FastLED.clear();\n" +
	"        for (int i = 0; i < NUM_LEDS / 2; i++) {\n" +
	"            int currentLed = (startIndex + i) % NUM_LEDS;\n" +
	"            CRGB color = CRGB(r, g, b);\n" +
	"            uint8_t fraction = map(i, 0, NUM_LEDS / 2, 0, 255);\n" +
	"            color.nscale8(fraction);\n" +
	"            ledstrip[currentLed] = color;\n" +
	"        }\n" +
	"        startIndex++;\n" +
	"        FastLED.show();\n" +
	"        FastLED.delay(delay);\n" +
	"    }\n" +
	"}\n";

const LEDSTRIP_RAINBOW_WAVE =
	"void ledstripRainbowWave() {\n" +
	"    int delay = map(LEDSTRIP_SPEED, 0, 100, 200, 20);\n" +
	"    uint8_t startIndex = 0;\n" +
	"    FastLED.setBrightness(255);\n" +
	"    for (int times = 0; times < NUM_LEDS * 4; times++) {\n" +
	"        FastLED.clear();\n" +
	"        for (int i = 0; i < NUM_LEDS / 2; i++) {\n" +
	"            int currentLed = (startIndex + i) % NUM_LEDS;\n" +
	"            uint8_t hue = map(i, 0, NUM_LEDS / 2, 0, 255);\n" +
	"            uint8_t brightness = map(i, 0, NUM_LEDS / 2, 10, 255);\n" +
	"            ledstrip[currentLed] = CHSV(hue, 255, brightness);\n" +
	"        }\n" +
	"        startIndex++;\n" +
	"        FastLED.show();\n" +
	"        FastLED.delay(delay);\n" +
	"    }\n" +
	"}\n";

function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.leaphy_led_set_strip = (block) => {
		const pin =
			arduino.valueToCode(block, "LED_SET_PIN", arduino.ORDER_ATOMIC) || "0";
		const num_leds =
			arduino.valueToCode(block, "LED_SET_LEDS", arduino.ORDER_ATOMIC) || "0";

		arduino.addDependency(Dependencies.FASTLED);
		arduino.addInclude("fastled", '#include "FastLED.h"');
		arduino.addDeclaration(
			`ledstrip${pin}`,
			`#define NUM_LEDS ${num_leds}\nCRGB ledstrip[NUM_LEDS];\n`,
		);
		arduino.addSetup(
			"ledstrip",
			`FastLED.addLeds<WS2812, ${pin}, GRB>(ledstrip, NUM_LEDS); `,
		);

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
		return `ledstrip[${led}] = CRGB(${red}, ${green}, ${blue}); FastLED.show();\n`;
	};

	arduino.forBlock.leaphy_led_set_speed = (block) => {
		const speedValue =
			arduino.valueToCode(block, "LED_SET_SPEEDVALUE", arduino.ORDER_ATOMIC) ||
			"0";
		arduino.addDeclaration(
			"ledstrip_speed",
			`#define LEDSTRIP_SPEED ${speedValue}\n`,
		);
		return "";
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

		switch (dropdownType) {
			case "0": {
				// Solid color
				return `fill_solid(ledstrip, NUM_LEDS, CRGB(${red}, ${green}, ${blue})); FastLED.show();\n`;
			}
			case "1": {
				// Breathe effect
				arduino.addDeclaration("ledstrip_breate", LEDSTRIP_BREATHE);
				return `ledstripBreathe(${red}, ${green}, ${blue});\n`;
			}
			case "3": {
				// Rainbow Wave
				arduino.addDeclaration("ledstrip_rainbow_wave", LEDSTRIP_RAINBOW_WAVE);
				return "ledstripRainbowWave();\n";
			}
			case "4": {
				// Rainbow
				arduino.addDeclaration("ledstrip_rainbow", LEDSTRIP_RAINBOW);
				return "ledstripRainbow();\n";
			}
			case "5": {
				// Wave with specific color
				arduino.addDeclaration("ledstrip_wave", LEDSTRIP_WAVE);
				return `ledstripWave(${red}, ${green}, ${blue});\n`;
			}
		}
		return "";
	};
}

export default getCodeGenerators;
