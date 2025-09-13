import type { Arduino } from "../../generators/arduino";
import { Dependencies } from "../../generators/arduino/dependencies";
import { getDistanceSonar, getTOF } from "../../generators/arduino/sensors";
import {
	type Setting,
	type SettingsToObject,
	i2cSetting,
	pinSetting,
} from "./settings";

type SetNode = (node: number, value: string) => string;

export abstract class Sensor {
	abstract type: string;
	abstract values: number;

	abstract name: string;
	renderName(_settings: unknown) {
		return this.name;
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

	name = "Time of Flight sensor";

	renderName(settings: SettingsToObject<typeof this.settings>) {
		if (settings.channel === -1) return this.name;

		return `Time of Flight sensor (channel: ${settings.channel})`;
	}

	settings = [i2cSetting("channel")];

	// I2C multiplexer integration for multi-sensor setups, with value normalization
	getValues(
		arduino: Arduino,
		setNode: SetNode,
		settings: SettingsToObject<typeof this.settings>,
	) {
		const value = `max(0.0f, min(1.0f, ${getTOF(arduino)} / 256.0f))`
		if (settings.channel === -1) return setNode(0, value);

		return `i2cSelectChannel(${settings.channel});\n${setNode(0, value)}i2cRestoreChannel();\n`;
	}
}

class DigitalSensor extends Sensor {
	type = "digital";
	values = 1;

	name = "Digital Pin";

	renderName(settings: SettingsToObject<typeof this.settings>) {
		return `Digital Pin ${settings.pin}`;
	}

	settings = [pinSetting("pin", "digital", "Pin", "Select the pin to use")];

	getValues(
		arduino: Arduino,
		setNode: SetNode,
		settings: SettingsToObject<typeof this.settings>,
	) {
		arduino.addSetup(
			`setup_input_${settings.pin}`,
			`pinMode(${settings.pin}, INPUT);`,
		);

		return setNode(0, `digitalRead(${settings.pin})`);
	}
}

// Normalizes 12-bit ADC values (0-4095) to 0-1 range for consistent ML input
class AnalogSensor extends Sensor {
	type = "analog";
	values = 1;

	name = "Analog Pin";

	renderName(settings: SettingsToObject<typeof this.settings>) {
		return `Analog Pin ${settings.pin}`;
	}

	settings = [pinSetting("pin", "analog", "Pin", "Select the pin to use")];

	getValues(
		arduino: Arduino,
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

	name = "Ultrasonic";

	renderName(settings: SettingsToObject<typeof this.settings>) {
		return `Ultrasonic sensor (trig: ${settings.trig}, echo: ${settings.echo})`;
	}

	settings = [
		pinSetting("trig", "digital", "Trig", "", "A3"),
		pinSetting("echo", "digital", "Echo", "", "A2"),
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

export const sensors: Sensor[] = [
	new DigitalSensor(),
	new AnalogSensor(),
	new ToFSensor(),
	new UltrasonicSensor(),
];

export const sensorByType = sensors.reduce(
	(prev, curr) => {
		prev[curr.type] = curr;

		return prev;
	},
	{} as Record<string, Sensor>,
);
