import type { Arduino } from "../arduino";
import {Dependencies} from "./dependencies";

function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.leaphy_segment_init = (block) => {
		const clk = block.getFieldValue("CLK");
		const dio = block.getFieldValue("DIO");

		arduino.addDependency(Dependencies.LEAPHY_EXTENSIONS);
		arduino.addInclude("tm1637", "#include <SegmentDisplay.h>");
		arduino.addDeclaration(
			"segment",
			`TM1637Display segment_display(${clk}, ${dio});`,
		);
		arduino.addSetup("segment", "segment_display.setBrightness(255);\n", false);

		return "";
	};

	arduino.forBlock.leaphy_matrix_init = (block) => {
		const din = block.getFieldValue("DIN");
		const clk = block.getFieldValue("CLK");
		const cs = block.getFieldValue("CS");

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

	arduino.forBlock.leaphy_sound_init = (block) => {
		const RX = block.getFieldValue("RX");
		const TX = block.getFieldValue("TX");

		arduino.addDependency(Dependencies.LEAPHY_EXTENSIONS);
		arduino.addInclude("sound", "#include <RedMP3.h>");
		arduino.addDeclaration("sound", `MP3 mp3(${RX}, ${TX});`);

		return "";
	};
}

export default getCodeGenerators;
