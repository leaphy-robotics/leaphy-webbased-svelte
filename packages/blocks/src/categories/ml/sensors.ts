import type { Arduino } from "../../generators/arduino";
import { Dependencies } from "../../generators/arduino/dependencies";
import {
	readSparkSensor,
	SPARK_ANALOG_MAX,
	sparkSensors,
} from "../../generators/arduino/leaphy_spark";
import {
	getDistanceSonar,
	getLidarValue,
	getTOF,
	measureLidar,
} from "../../generators/arduino/sensors";
import {
	i2cSetting,
	pinSetting,
	type Setting,
	type SettingsToObject,
	selectSetting,
} from "./settings";

type SetNode = (node: number, value: string) => string;

export type SensorGroup = "spark" | "pins" | "i2c";

export abstract class Sensor {
	abstract type: string;
	abstract values: number;

	// Used to group sensors in the UI and explain them to the user
	abstract group: SensorGroup;
	abstract description: string;

	abstract name: string;
	renderName(_settings: unknown): {
		translation: string;
		values?: Record<string, string>;
	} {
		return { translation: this.name };
	}

	abstract settings: Setting<unknown>[];

	abstract getValues(
		arduino: Arduino,
		setNode: (node: number, value: string) => string,
		settings: unknown,
	): string;
}

class ToFSensor extends Sensor {
	type = "ToF";
	values = 1;
	group: SensorGroup = "i2c";
	description = "ML_SENSOR_TOF_DESCRIPTION";

	name = "TIME_OF_FLIGHT_SENSOR";

	renderName(settings: SettingsToObject<typeof this.settings>) {
		if (settings.channel === -1)
			return { translation: "TIME_OF_FLIGHT_SENSOR" };

		return {
			translation: "TIME_OF_FLIGHT_SENSOR_CHANNEL",
			values: { channel: `${settings.channel}` },
		};
	}

	settings = [i2cSetting("channel")];

	// I2C multiplexer integration for multi-sensor setups, with value normalization
	getValues(
		arduino: Arduino,
		setNode: SetNode,
		settings: SettingsToObject<typeof this.settings>,
	) {
		const value = `max(0.0f, min(1.0f, ${getTOF(arduino)} / 256.0f))`;
		if (settings.channel === -1) return setNode(0, value);

		return `i2cSelectChannel(${settings.channel});\n${setNode(0, value)}i2cRestoreChannel();\n`;
	}
}

class DigitalSensor extends Sensor {
	type = "digital";
	values = 1;
	group: SensorGroup = "pins";
	description = "ML_SENSOR_DIGITAL_DESCRIPTION";

	name = "DIGITAL_PIN_NAME";

	renderName(settings: SettingsToObject<typeof this.settings>) {
		return { translation: "DIGITAL_PIN", values: { pin: `${settings.pin}` } };
	}

	settings = [
		pinSetting(
			"pin",
			"digital",
			"ML_SETTING_PIN",
			"ML_SETTING_PIN_DESCRIPTION",
		),
	];

	getValues(
		arduino: Arduino,
		setNode: SetNode,
		settings: SettingsToObject<typeof this.settings>,
	) {
		// Analog pins used as digital pins (14+) need to be remapped on some boards, e.g. the ESP32
		const pin = arduino.getRawPinMapping(settings.pin);
		arduino.addSetup(`setup_input_${pin}`, `pinMode(${pin}, INPUT);`);

		return setNode(0, `digitalRead(${pin})`);
	}
}

// Normalizes 12-bit ADC values (0-4095) to 0-1 range for consistent ML input
class AnalogSensor extends Sensor {
	type = "analog";
	values = 1;
	group: SensorGroup = "pins";
	description = "ML_SENSOR_ANALOG_DESCRIPTION";

	name = "ANALOG_PIN_NAME";

	renderName(settings: SettingsToObject<typeof this.settings>) {
		return { translation: "ANALOG_PIN", values: { pin: `${settings.pin}` } };
	}

	settings = [
		pinSetting("pin", "analog", "ML_SETTING_PIN", "ML_SETTING_PIN_DESCRIPTION"),
	];

	getValues(
		_arduino: Arduino,
		setNode: SetNode,
		settings: SettingsToObject<typeof this.settings>,
	) {
		return setNode(0, `analogRead(${settings.pin}) / 4095.0f`);
	}
}

// Normalizes ultrasonic distance values (0-256cm) to 0-1 range
class UltrasonicSensor extends Sensor {
	type = "ultrasonic";
	values = 1;
	group: SensorGroup = "pins";
	description = "ML_SENSOR_ULTRASONIC_DESCRIPTION";

	name = "ULTRASONIC_SENSOR_NAME";

	renderName(settings: SettingsToObject<typeof this.settings>) {
		return {
			translation: "ULTRASONIC_SENSOR",
			values: { trig: `${settings.trig}`, echo: `${settings.echo}` },
		};
	}

	settings = [
		pinSetting(
			"trig",
			"digital",
			"ML_SETTING_TRIG",
			"ML_SETTING_TRIG_DESCRIPTION",
			"17",
		),
		pinSetting(
			"echo",
			"digital",
			"ML_SETTING_ECHO",
			"ML_SETTING_ECHO_DESCRIPTION",
			"16",
		),
	];

	getValues(
		arduino: Arduino,
		setNode: SetNode,
		settings: SettingsToObject<typeof this.settings>,
	) {
		return setNode(
			0,
			`max(0.0f, min(1.0f, ${getDistanceSonar(arduino, settings.trig, settings.echo)} / 256.0f))`,
		);
	}
}

class LidarSensor extends Sensor {
	type = "lidar";
	values = 64;
	group: SensorGroup = "i2c";
	description = "ML_SENSOR_LIDAR_DESCRIPTION";

	name = "LIDAR_SENSOR";

	renderName(settings: SettingsToObject<typeof this.settings>) {
		if (settings.channel === -1) return { translation: "LIDAR_SENSOR" };

		return {
			translation: "LIDAR_SENSOR_CHANNEL",
			values: { channel: `${settings.channel}` },
		};
	}

	settings = [i2cSetting("channel")];

	// I2C multiplexer integration for multi-sensor setups, with value normalization
	getValues(
		arduino: Arduino,
		setNode: SetNode,
		settings: SettingsToObject<typeof this.settings>,
	) {
		let code = `${measureLidar(arduino)};\n`;
		for (let i = 0; i < 64; i++) {
			code += `${setNode(i, getLidarValue(i))}`;
		}

		if (settings.channel === -1) return code;

		return `i2cSelectChannel(${settings.channel});\n${code}i2cRestoreChannel();\n`;
	}
}

const sparkSensorNames: Record<string, string> = {
	left_line_sensor: "ML_SPARK_LEFT_LINE_SENSOR",
	right_line_sensor: "ML_SPARK_RIGHT_LINE_SENSOR",
	left_ambient: "ML_SPARK_LEFT_LIGHT_SENSOR",
	right_ambient: "ML_SPARK_RIGHT_LIGHT_SENSOR",
	potentiometer: "ML_SPARK_POTENTIOMETER",
	button_1: "ML_SPARK_BUTTON_1",
	button_2: "ML_SPARK_BUTTON_2",
	button_3: "ML_SPARK_BUTTON_3",
};

// Sensors on the Leaphy Spark shield, normalized to 0-1
class SparkSensor extends Sensor {
	type = "spark";
	values = 1;
	group: SensorGroup = "spark";
	description = "ML_SENSOR_SPARK_DESCRIPTION";

	name = "ML_SPARK_SENSOR";

	renderName(settings: SettingsToObject<typeof this.settings>) {
		return {
			translation: sparkSensorNames[settings.sensor] ?? this.name,
		};
	}

	settings = [
		selectSetting(
			"sensor",
			"ML_SETTING_SPARK_SENSOR",
			"ML_SETTING_SPARK_SENSOR_DESCRIPTION",
			Object.entries(sparkSensorNames).map(
				([id, name]) => [name, id] as [string, string],
			),
		),
	];

	getValues(
		arduino: Arduino,
		setNode: SetNode,
		settings: SettingsToObject<typeof this.settings>,
	) {
		const value = readSparkSensor(arduino, settings.sensor);
		if (sparkSensors[settings.sensor]?.type === "analog") {
			return setNode(
				0,
				`max(0.0f, min(1.0f, ${value} / ${SPARK_ANALOG_MAX}.0f))`,
			);
		}

		return setNode(0, value);
	}
}

export const sensors: Sensor[] = [
	new SparkSensor(),
	new DigitalSensor(),
	new AnalogSensor(),
	new ToFSensor(),
	new UltrasonicSensor(),
	new LidarSensor(),
];

export const sensorByType = sensors.reduce(
	(prev, curr) => {
		prev[curr.type] = curr;

		return prev;
	},
	{} as Record<string, Sensor>,
);
