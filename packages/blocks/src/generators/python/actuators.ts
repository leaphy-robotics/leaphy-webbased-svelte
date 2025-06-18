import { Order } from "blockly/python";
import { type MicroPythonGenerator, pin_name_aliases } from "../python";

/**
 * Block definitions for the BKY_ACTUATOREN_CATEGORY toolbox-category.
 * Contains instructions for output-peripherals, such as serial lines and motors.
 */

function addOledSupport(generator: MicroPythonGenerator, i2c_channel: string) {
	generator.addI2cSupport(true);
	generator.addImport("leaphymicropython.actuators", "ssd1306");
	generator.addDefinition(
		"smalldisplaysize",
		"SMALL_OLED_WIDTH = 128\nSMALL_OLED_HEIGHT = 64",
	);
	//Note that, because the display's initialize_device function does *not* currently switch
	// channels, it's done manually here.
	generator.addDefinition(
		`channel${i2c_channel}oled`,
		`select_channel(I2C_CONNECTION, MULTIPLEXER_ADDRESS, ${i2c_channel === "BC" ? 255 : i2c_channel})\nSMALL_OLED_${i2c_channel} = ssd1306.SSD1306I2C(SMALL_OLED_WIDTH, SMALL_OLED_HEIGHT, I2C_CONNECTION)\nSMALL_OLED_${i2c_channel}.initialize_device()`,
	);
}

function getCodeGenerators(python: MicroPythonGenerator) {
	python.forBlock.leaphy_serial_print_line = (block, generator) => {
		const text = generator.valueToCode(block, "VALUE", Order.ATOMIC) || "None";
		return `print(${text})\n`;
	};

	python.forBlock.leaphy_io_digitalwrite = (block, generator) => {
		const pin = `D${block.getFieldValue("PIN") || "0"}`;
		const value = generator.valueToCode(block, "STATE", Order.ATOMIC);

		if (generator.reserveDigitalPin(pin, false)) {
			return `pin_${pin.toLowerCase()}.value(${value})\n`;
		}
		return `# Caution! This pin is not available as digital output! Check if any of the following pins are already referenced: ${pin_name_aliases(pin)?.join("/")}\n`;
	};

	python.forBlock.leaphy_io_analogwrite = (block, generator) => {
		const pin = `D${block.getFieldValue("PIN") || "0"}`;
		const value = generator.valueToCode(block, "NUM", Order.ATOMIC);

		if (generator.reserveAnalogPin(pin, false)) {
			return `pwm_${pin.toLowerCase()}.duty_u16(${value})\n`;
		}
		return `# Caution! This pin is not available as analog output! Check if any of the following pins are already referenced: ${pin_name_aliases(pin)?.join("/")}\n`;
	};

	python.forBlock.leaphy_display_clear = (block, generator) => {
		const i2c_channel = generator.currentI2cChannel()?.toString() || "BC";

		addOledSupport(generator, i2c_channel);

		return `SMALL_OLED_${i2c_channel}.fill(0)\n`;
	};

	python.forBlock.leaphy_display_print_line = (block, generator) => {
		const i2c_channel = generator.currentI2cChannel()?.toString() || "BC";

		addOledSupport(generator, i2c_channel);

		const to_write = generator.valueToCode(block, "VALUE", Order.NONE);
		const row_no = block.getFieldValue("DISPLAY_ROW");

		return `SMALL_OLED_${i2c_channel}.text(str(${to_write}), 0, ${row_no * 8})\n`;
	};

	python.forBlock.leaphy_display_print_value = (block, generator) => {
		const i2c_channel = generator.currentI2cChannel()?.toString() || "BC";

		addOledSupport(generator, i2c_channel);

		const name_text = generator.valueToCode(block, "NAME", Order.NONE);
		const value_text = generator.valueToCode(block, "VALUE", Order.NONE);
		const to_write = `str(${name_text}) + ' = ' + str(${value_text})`;
		const row_no = block.getFieldValue("DISPLAY_ROW");

		return `SMALL_OLED_${i2c_channel}.text(${to_write}, 0, ${row_no * 8})\n`;
	};

	python.forBlock.leaphy_display_display = (block, generator) => {
		const i2c_channel = generator.currentI2cChannel()?.toString() || "BC";

		addOledSupport(generator, i2c_channel);

		return `SMALL_OLED_${i2c_channel}.show()\n`;
	};
}

export default getCodeGenerators;
