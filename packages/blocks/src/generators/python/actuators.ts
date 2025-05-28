import { Order } from "blockly/python";
import type { MicroPythonGenerator } from "../python";

/**
 * Block definitions for the BKY_ACTUATOREN_CATEGORY toolbox-category.
 * Contains instructions for output-peripherals, such as serial lines and motors.
 */

function addOledSupport(generator: MicroPythonGenerator, i2c_channel: number) {
	generator.addI2cSupport(true);
	generator.addImport("leaphymicropython.actuators", "ssd1306");
	generator.addDefinition(
		"smalldisplaysize",
		"SMALL_OLED_WIDTH = 128\nSMALL_OLED_HEIGHT = 64",
	);
	generator.addDefinition(
		`channel${i2c_channel}oled`,
		`select_channel(i2c_object, MULTIPLEXER_ADDRESS, ${i2c_channel})\nSMALL_OLED_${i2c_channel} = ssd1306.SSD1306SPI(SMALL_OLED_WIDTH, SMALL_OLED_HEIGHT, I2C_CONNECTION)\nSMALL_OLED_${i2c_channel}.initialize_device()`,
	);
}

function getCodeGenerators(python: MicroPythonGenerator) {
	python.forBlock.leaphy_serial_print_line = (block, generator) => {
		const text = generator.valueToCode(block, "VALUE", Order.ATOMIC) || "None";
		return `print(${text})\n`;
	};

	python.forBlock.leaphy_io_digitalwrite = (block, generator) => {
		generator.addImport("leaphymicropython.utils.pins", "set_pin");

		const pin = block.getFieldValue("PIN") || "0";
		const value = generator.valueToCode(block, "STATE", Order.ATOMIC);

		return `set_pin(${pin}, ${value})\n`;
	};

	python.forBlock.leaphy_io_analogwrite = (block, generator) => {
		generator.addImport("leaphymicropython.utils.pins", "set_pwm");

		const pin = block.getFieldValue("PIN") || "0";
		const value = generator.valueToCode(block, "NUM", Order.ATOMIC);

		return `set_pwm(${pin}, ${value})\n`;
	};

	python.forBlock.leaphy_display_clear = (block, generator) => {
		const i2c_channel = generator.currentI2cChannel();
		if (i2c_channel == null) {
			return null;
		}
		addOledSupport(generator, i2c_channel);

		return `SMALL_OLED_${i2c_channel}.fill(0)\n`;
	};

	python.forBlock.leaphy_display_print_line = (block, generator) => {
		const i2c_channel = generator.currentI2cChannel();
		if (i2c_channel == null) {
			return null;
		}
		addOledSupport(generator, i2c_channel);

		const to_write = generator.valueToCode(block, "VALUE", Order.NONE);
		const row_no = block.getFieldValue("DISPLAY_ROW");

		return `SMALL_OLED_${i2c_channel}.text(str(${to_write}), 0, ${row_no * 8})\n`;
	};

	python.forBlock.leaphy_display_print_value = (block, generator) => {
		const i2c_channel = generator.currentI2cChannel();
		if (i2c_channel == null) {
			return null;
		}
		addOledSupport(generator, i2c_channel);

		const name_text = generator.valueToCode(block, "NAME", Order.NONE);
		const value_text = generator.valueToCode(block, "VALUE", Order.NONE);
		const to_write = `str(${name_text}) + ' = ' + str(${value_text})`;
		const row_no = block.getFieldValue("DISPLAY_ROW");

		return `SMALL_OLED_${i2c_channel}.text(${to_write}, 0, ${row_no * 8})\n`;
	};

	python.forBlock.leaphy_display_display = (block, generator) => {
		const i2c_channel = generator.currentI2cChannel();
		if (i2c_channel == null) {
			return null;
		}
		addOledSupport(generator, i2c_channel);

		return `SMALL_OLED_${i2c_channel}.show()\n`;
	};
}

export default getCodeGenerators;
