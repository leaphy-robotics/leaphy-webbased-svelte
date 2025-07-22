import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";
import { addI2CDeclarations } from "./i2c";

function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.time_delay = (block) => {
		const delayTime =
			arduino.valueToCode(block, "DELAY_TIME_MILI", arduino.ORDER_ATOMIC) ||
			"0";

		return `delay(${delayTime});\n`;
	};

	arduino.forBlock.leaphy_serial_available = () => {
		arduino.addSetup("serial", "Serial.begin(115200);", false);
		const code = "Serial.available()";
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_serial_read_line = () => {
		arduino.addSetup("serial", "Serial.begin(115200);", false);
		const code = "Serial.readStringUntil('\\n')";
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_serial_print_line = (block) => {
		arduino.addSetup("serial", "Serial.begin(115200);", false);
		const value =
			arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
		return `Serial.println(${value});\n`;
	};

	arduino.forBlock.leaphy_serial_print_value = (block) => {
		arduino.addSetup("serial", "Serial.begin(115200);", false);
		const name =
			arduino.valueToCode(block, "NAME", arduino.ORDER_ATOMIC) || "0";
		const value =
			arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
		return `Serial.print(${name});\nSerial.print(" = ");\nSerial.println(${value});\n`;
	};

	arduino.forBlock.leaphy_start = (block) => {
		// Define the Start procedure
		const funcName = "leaphyProgram";
		let branch = arduino.statementToCode(block, "STACK");
		if (arduino.STATEMENT_PREFIX) {
			const id = block.id.replace(/\$/g, "$$$$"); // Issue 251.
			branch =
				arduino.prefixLines(
					arduino.STATEMENT_PREFIX.replace(/%1/g, `'${id}'`),
					arduino.INDENT,
				) + branch;
		}
		if (arduino.INFINITE_LOOP_TRAP) {
			branch =
				arduino.INFINITE_LOOP_TRAP.replace(/%1/g, `'${block.id}'`) + branch;
		}
		const returnType = "void";
		let code = `${returnType} ${funcName}() {\n${branch}}`;

		code = arduino.scrub_(block, code);
		arduino.addDeclaration(funcName, code, true);
		arduino.addSetup("userSetupCode", `${funcName}();`, false);
		return null;
	};

	arduino.forBlock.leaphy_get_air_pressure = () => {
		arduino.addDependency(Dependencies.ADAFRUIT_BMP280_BAR);
		arduino.addInclude("bmp280", "#include <Adafruit_BMP280.h>");
		arduino.addDeclaration("bmp280", "Adafruit_BMP280 bmp280;");
		const setup = arduino.addI2CSetup(
			"bmp280",
			"bmp280.begin(BMP280_ADDRESS_ALT);\n" +
				"      bmp280.setSampling(Adafruit_BMP280::MODE_NORMAL,\n" +
				"                      Adafruit_BMP280::SAMPLING_X2,\n" +
				"                      Adafruit_BMP280::SAMPLING_X16,\n" +
				"                      Adafruit_BMP280::FILTER_X16,\n" +
				"                      Adafruit_BMP280::STANDBY_MS_500);\n",
		);
		arduino.addDeclaration(
			"bmp280_get_air_pressure",
			`double getAirPressure() {\n    ${setup}\n    return bmp280.readPressure() / 100;\n}`,
		);
		return ["getAirPressure()", arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_gas_sensor = (block) => {
		arduino.addDependency(Dependencies.ADAFRUIT_SGP30_GAS);
		arduino.addInclude("leaphy_gas_sensor", "#include <Adafruit_SGP30.h>");
		arduino.addDeclaration("leaphy_gas_sensor", "Adafruit_SGP30 sgp;");
		const setup = arduino.addI2CSetup("gas", "if (! sgp.begin()) return -1;\n");

		const gasValue = block.getFieldValue("GAS");
		let code = "";
		if (gasValue === "TVOC") {
			code = "getGasValueTVOC()";
			arduino.addDeclaration(
				"leaphy_gas_valueTVOC",
				`int getGasValueTVOC() {\n    ${setup}    sgp.IAQmeasure();\n    return sgp.TVOC;\n}\n`,
			);
		} else if (gasValue === "eCO2") {
			code = "getGasValueCOTWO()";
			arduino.addDeclaration(
				"leaphy_gas_valueCOTWO",
				`int getGasValueCOTWO() {\n    ${setup}    sgp.IAQmeasure();\n    return sgp.eCO2;\n}\n`,
			);
		} else if (gasValue === "Raw H2") {
			code = "getGasValueHTWO()";
			arduino.addDeclaration(
				"leaphy_gas_valueHTWO",
				`int getGasValueHTWO() {\n    ${setup}    sgp.IAQmeasureRaw();\n    return sgp.rawH2;\n}\n`,
			);
		} else if (gasValue === "RAWETHANOL") {
			code = "getGasValueETHANOL()";
			arduino.addDeclaration(
				"leaphy_gas_valueETHANOL",
				`int getGasValueETHANOL() {\n    ${setup}    sgp.IAQmeasureRaw();\n    return sgp.rawEthanol;\n}\n`,
			);
		}
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_i2c_rgb_color = (block) => {
		const setup = arduino.addI2CSetup("apds9960", "APDS.begin();\n");

		const rgb_declaration = `int r[8], g[8], b[8], a[8];\nint getAPDS9960Color(int colorType) {\n    ${setup}    uint8_t channel = i2cGetChannel();\n    if (APDS.colorAvailable()) {\n        APDS.readColor(r[channel], g[channel], b[channel], a[channel]);\n    }\n    switch(colorType) {\n      case 0:\n        return r[channel];\n      case 1:\n        return g[channel];\n      case 2:\n        return b[channel];\n      case 3:\n        return a[channel];\n    }\n}\n`;
		const colorType = block.getFieldValue("COLOR_TYPE");

		arduino.addDependency(Dependencies.APDS9960_RGB);
		arduino.addInclude("apds9960", "#include <Arduino_APDS9960.h>");
		arduino.addDeclaration("apds9960_rgb", rgb_declaration);

		const code = `getAPDS9960Color(${colorType})`;
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_i2c_gesture = () => {
		const setup = arduino.addI2CSetup("apds9960", "APDS.begin();\n");
		const gesture_declaration = `int gesture[8];\nint getAPDS9960Gesture() {\n    ${setup}    uint8_t channel = i2cGetChannel();\n    if (APDS.gestureAvailable()) {\n        gesture[channel] = APDS.readGesture();\n    }\n    return gesture[channel];\n}\n`;

		arduino.addDependency(Dependencies.APDS9960_RGB);
		arduino.addInclude("apds9960", "#include <Arduino_APDS9960.h>");
		arduino.addDeclaration("apds9960_gesture", gesture_declaration);

		const code = "getAPDS9960Gesture()";
		return [code, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.i2c_use_channel = (block) => {
		const channel = block.getFieldValue("CHANNEL");
		const innerCode = arduino.statementToCode(block, "DO");

		addI2CDeclarations();

		return `i2cSelectChannel(${channel});\n${innerCode}i2cRestoreChannel();\n`;
	};

	arduino.forBlock.i2c_list_devices = () => {
		const LIST_DEVICES =
			"void i2cListDevices() {\n" +
			"    for (int channel = 0; channel < 8; channel++) {\n" +
			'        Serial.print("Scanning channel ");\n' +
			"        Serial.print(channel);\n" +
			'        Serial.println(":");\n' +
			"        \n" +
			"        i2cSelectChannel(channel);\n" +
			"        \n" +
			"        for (DeviceAddress address : deviceMap) {\n" +
			"            Wire.beginTransmission(address.address);\n" +
			"            int error = Wire.endTransmission();\n" +
			"            \n" +
			"            if (error == 0) {\n" +
			'                Serial.print("Found: ");\n' +
			"                Serial.print(address.device);\n" +
			'                Serial.print(" at address 0x");\n' +
			"                \n" +
			"                if (address.address < 16) {\n" +
			'                    Serial.print("0");\n' +
			"                }\n" +
			"                Serial.println(address.address, HEX);\n" +
			"            }\n" +
			"        }\n" +
			"        \n" +
			"        i2cRestoreChannel();\n" +
			"    }\n" +
			"}\n";

		const DEVICE_CHANNEL_MAP =
			"struct DeviceAddress { \n" +
			"  uint8_t address;\n" +
			"  char* device;\n" +
			"};\n" +
			"\n" +
			"DeviceAddress deviceMap[] = {\n" +
			'    {0x0D, "Compass"},\n' +
			'    {0x29, "Color Sensor / ToF Sensor"},\n' +
			'    {0x39, "RGB + Gesture Sensor"},\n' +
			'    {0x3C, "Screen"},\n' +
			'    {0x58, "Gas Sensor"},\n' +
			'    {0x76, "Air Pressure Sensor"}\n' +
			"};\n";

		arduino.addSetup("serial", "Serial.begin(115200);", false);
		addI2CDeclarations();
		arduino.addInclude("i2c_device_map", DEVICE_CHANNEL_MAP);
		arduino.addDeclaration("i2c_list_devices", LIST_DEVICES);

		return "i2cListDevices();\n";
	};

	arduino.forBlock.leaphy_segment_set = (block) => {
		const num = arduino.valueToCode(block, "NUM", arduino.ORDER_ATOMIC) || "0";

		return `segment_display.showNumberDec(${num});\n`;
	};

	arduino.forBlock.leaphy_segment_clear = () => "segment_display.clear();\n";

	arduino.forBlock.leaphy_segment_set_brightness = (block) => {
		const brightness =
			arduino.valueToCode(block, "BRIGHTNESS", arduino.ORDER_ATOMIC) || "0";

		return `segment_display.setBrightness(${brightness}/100*255);\n`;
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

	arduino.forBlock.leaphy_matrix_fill = (block) => {
		const matrix = block.getFieldValue("MATRIX");

		return (
			`matrix.setRow(0, 0, B${matrix[0].join("")});\n` +
			`matrix.setRow(0, 1, B${matrix[1].join("")});\n` +
			`matrix.setRow(0, 2, B${matrix[2].join("")});\n` +
			`matrix.setRow(0, 3, B${matrix[3].join("")});\n` +
			`matrix.setRow(0, 4, B${matrix[4].join("")});\n` +
			`matrix.setRow(0, 5, B${matrix[5].join("")});\n` +
			`matrix.setRow(0, 6, B${matrix[6].join("")});\n` +
			`matrix.setRow(0, 7, B${matrix[7].join("")});\n`
		);
	};

	arduino.forBlock.leaphy_sound_play = (block) => {
		const item =
			arduino.valueToCode(block, "ITEM", arduino.ORDER_ATOMIC) || "0";

		return `mp3.playWithIndex(${item});\n`;
	};

	arduino.forBlock.leaphy_sound_stop = () => "mp3.stopPlay();\n";

	arduino.forBlock.leaphy_sound_set_volume = (block) => {
		const volume =
			arduino.valueToCode(block, "VOLUME", arduino.ORDER_ATOMIC) || "0";

		return `mp3.setVolume(${volume}/100.0*30.0);\n`;
	};

	arduino.forBlock.leaphy_read_accelerometer = (block) => {
		arduino.addDependency(Dependencies.ADAFRUIT_LSM6DS_ACCELEROMETER);
		arduino.addInclude("GyroAccel", "#include <Adafruit_LSM6DS3TRC.h>");
		const setup = arduino.addI2CSetup(
			"GyroAccel",
			"if (!lsm6ds3trc.begin_I2C()) {\n" +
				"        return -1;\n" +
				"      }\n\n" +
				"      lsm6ds3trc.configInt1(false, false, true);\n" +
				"      lsm6ds3trc.configInt2(false, true, false);\n",
		);
		arduino.addDeclaration(
			"GyroAccel",
			"Adafruit_LSM6DS3TRC lsm6ds3trc;\n" +
				"float buffer_x = 0.0, buffer_y = 0.0, buffer_z = 0.0;\n\n",
			false,
			3,
		);
		arduino.addDeclaration(
			"Accelerometer",
			`double readAccelerometer(int channel) {\n  ${setup}  lsm6ds3trc.readAcceleration(buffer_x, buffer_y, buffer_z);\n\n  switch(channel) {\n    case 0:\n      return (double) buffer_x;\n    case 1:\n      return (double) buffer_y;\n    case 2:\n      return (double) buffer_z;\n  }\n}`,
			false,
			2,
		);

		const channel = block.getFieldValue("ACCELEROMETER_AXIS");

		return [`readAccelerometer(${channel})`, arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_read_gyroscope = (block) => {
		arduino.addDependency(Dependencies.ADAFRUIT_LSM6DS_ACCELEROMETER);
		arduino.addInclude("GyroAccel", "#include <Adafruit_LSM6DS3TRC.h>");

		const setup = arduino.addI2CSetup(
			"GyroAccel",
			"if (!lsm6ds3trc.begin_I2C()) {\n" +
				"        return -1;\n" +
				"      }\n\n" +
				"      lsm6ds3trc.configInt1(false, false, true);\n" +
				"      lsm6ds3trc.configInt2(false, true, false);\n",
		);
		arduino.addDeclaration(
			"GyroAccel",
			"Adafruit_LSM6DS3TRC lsm6ds3trc;\n" +
				"float buffer_x = 0.0, buffer_y = 0.0, buffer_z = 0.0;\n\n",
			false,
			3,
		);
		arduino.addDeclaration(
			"Gyroscope",
			`double readGyroscope(int channel) {\n  ${setup}  lsm6ds3trc.readGyroscope(buffer_x, buffer_y, buffer_z);\n\n  switch(channel) {\n    case 0:\n      return (double) buffer_x;\n    case 1:\n      return (double) buffer_y;\n    case 2:\n      return (double) buffer_z;\n  }\n}`,
			false,
			2,
		);

		const channel = block.getFieldValue("GYROSCOPE_AXIS");

		return [`readGyroscope(${channel})`, arduino.ORDER_ATOMIC];
	};
}
export default getCodeGenerators;
