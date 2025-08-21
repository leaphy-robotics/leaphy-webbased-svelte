/**
 * Machine Learning sensor definitions and implementations.
 *
 * This module provides sensor abstractions for machine learning data collection.
 * It defines an abstract sensor base class and concrete implementations for various
 * sensor types including digital pins, analog pins, ultrasonic sensors, and Time of Flight sensors.
 *
 * Each sensor provides:
 * - Configuration settings (pins, channels, etc.)
 * - Value reading logic for Arduino code generation
 * - Display name rendering based on configuration
 */

import type { Arduino } from "../../generators/arduino";
import { Dependencies } from "../../generators/arduino/dependencies";
import { getDistanceSonar, getTOF } from "../../generators/arduino/sensors";
import {
	type Setting,
	type SettingsToObject,
	i2cSetting,
	pinSetting,
} from "./settings";

/** Callback type for setting sensor values in generated code */
type SetNode = (node: number, value: string) => string;

/**
 * Abstract base class for all ML sensors.
 *
 * Defines the interface that all ML sensors must implement including:
 * - Sensor identification and configuration
 * - Arduino code generation for reading values
 * - Settings management for sensor configuration
 */
export abstract class Sensor {
	/** Unique identifier for this sensor type */
	abstract type: string;
	/** Number of values this sensor produces */
	abstract values: number;

	/** Display name for this sensor type */
	abstract name: string;

	/**
	 * Renders a display name based on sensor settings.
	 * Override to provide context-specific naming (e.g., "Digital Pin 5").
	 * @param _settings The configured settings for this sensor instance
	 * @returns Display name string
	 */
	renderName(_settings: unknown) {
		return this.name;
	}

	/** Configuration settings available for this sensor type */
	abstract settings: Setting<unknown>[];

	/**
	 * Generates Arduino code to read values from this sensor.
	 * @param arduino The Arduino code generator instance
	 * @param setNode Callback to set each sensor value in the generated code
	 * @param settings The configured settings for this sensor instance
	 * @returns Generated Arduino code string
	 */
	abstract getValues(
		arduino: Arduino,
		setNode: (node: number, value: string) => string,
		settings: unknown,
	): string;
}

/**
 * Time of Flight (ToF) distance sensor implementation.
 *
 * Supports both direct connection and multiplexed I2C operation.
 * When using I2C multiplexer, automatically switches to the correct channel.
 * Values are normalized to 0-1 range (0-256mm mapped to 0.0-1.0).
 */
class ToFSensor extends Sensor {
	type = "ToF";
	values = 1;

	name = "Time of Flight sensor";

	renderName(settings: SettingsToObject<typeof this.settings>) {
		if (settings.channel === -1) return this.name;

		return `Time of Flight sensor (channel: ${settings.channel})`;
	}

	settings = [i2cSetting("channel")];

	getValues(
		arduino: Arduino,
		setNode: SetNode,
		settings: SettingsToObject<typeof this.settings>,
	) {
		if (settings.channel === -1) return setNode(0, getTOF(arduino));

		return `i2cSelectChannel(0);\n${setNode(0, `max(0.0f, min(1.0f, ${getTOF(arduino)} / 256.0f))`)}i2cRestoreChannel();\n`;
	}
}

/**
 * Digital pin sensor implementation.
 *
 * Reads digital HIGH/LOW values from any digital pin.
 * Automatically configures the pin as INPUT during setup.
 * Returns 1 for HIGH, 0 for LOW.
 */
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

/**
 * Analog pin sensor implementation.
 *
 * Reads analog values from any analog pin and normalizes to 0-1 range.
 * Uses 12-bit ADC resolution (0-4095) which is divided by 4095.0 for normalization.
 */
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

/**
 * Ultrasonic distance sensor implementation.
 *
 * Uses trigger and echo pins to measure distance via ultrasonic pulses.
 * Values are normalized to 0-1 range (0-256cm mapped to 0.0-1.0).
 * Requires separate trigger and echo pins (defaults to A3 and A2).
 */
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

/** Array of all available sensor implementations */
export const sensors: Sensor[] = [
	new DigitalSensor(),
	new AnalogSensor(),
	new ToFSensor(),
	new UltrasonicSensor(),
];

/**
 * Lookup table mapping sensor type strings to their implementations.
 * Used for resolving sensor references during deserialization.
 */
export const sensorByType = sensors.reduce(
	(prev, curr) => {
		prev[curr.type] = curr;

		return prev;
	},
	{} as Record<string, Sensor>,
);
