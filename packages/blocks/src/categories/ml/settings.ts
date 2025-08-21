/**
 * Settings framework for ML sensor configuration.
 *
 * This module provides a type-safe settings system for configuring ML sensors.
 * It defines setting types (select, text, pin) and helper functions for creating
 * common setting configurations like I2C channels and pin selections.
 *
 * The settings system ensures type safety by using TypeScript's advanced type
 * system to map setting definitions to their runtime values.
 */

/**
 * Base interface for all setting types.
 * @template ReturnType The TypeScript type this setting will produce at runtime
 */
export interface Setting<ReturnType> {
	/** Unique identifier for this setting */
	id: string;
	/** Type of setting control (select, text, pin) */
	type: string;
	/** Display name shown to the user */
	name: string;
	/** Help text explaining what this setting does */
	description: string;
	/** TypeScript type marker (not used at runtime) */
	_returnType: ReturnType;

	/** Available options for select-type settings */
	options?: [string, any][];
	/** Default value for the setting */
	default?: string;
	/** Pin type constraint for pin-type settings */
	pinType?: string;
}

/**
 * Creates a select dropdown setting with predefined options.
 * @template Id The setting ID type for type safety
 * @template Type The value type of the selected option
 * @param id Unique identifier for this setting
 * @param name Display name for the setting
 * @param description Help text explaining the setting
 * @param options Array of [label, value] pairs for the dropdown
 * @returns Typed setting definition for a select control
 */
export function selectSetting<Id extends string, Type>(
	id: Id,
	name: string,
	description: string,
	options: [string, Type][],
) {
	return {
		type: "select",
		_returnType: null as unknown as Type,

		id,
		options,
		name,
		description,
	} as Setting<Type> & { id: Id; options: [string, Type][] };
}

/**
 * Creates a text input setting.
 * @template Id The setting ID type for type safety
 * @param id Unique identifier for this setting
 * @param name Display name for the setting
 * @param description Help text explaining the setting
 * @returns Typed setting definition for a text input control
 */
export function textSetting<Id extends string>(
	id: Id,
	name: string,
	description: string,
) {
	return {
		type: "text",
		_returnType: null as unknown as string,

		id,
		name,
		description,
	} as Setting<string> & { id: Id };
}

/**
 * Creates an I2C channel selection setting.
 * Provides options for no multiplexer (None) or channels 0-7.
 * @template Id The setting ID type for type safety
 * @param id Unique identifier for this setting
 * @returns Typed setting definition for I2C channel selection
 */
export function i2cSetting<Id extends string>(id: Id) {
	return selectSetting(id, "Channel", "Select an I2C channel", [
		["None", -1],
		["0", 0],
		["1", 1],
		["2", 2],
		["3", 3],
		["4", 4],
		["5", 5],
		["6", 6],
		["7", 7],
	]);
}

/**
 * Creates a pin selection setting for Arduino pins.
 * @template Id The setting ID type for type safety
 * @param id Unique identifier for this setting
 * @param type Type of pin (digital, analog, or pwm)
 * @param name Display name for the setting
 * @param description Help text explaining the setting
 * @param defaultValue Default pin value (empty string if none)
 * @returns Typed setting definition for pin selection
 */
export function pinSetting<Id extends string>(
	id: Id,
	type: "digital" | "analog" | "pwm",
	name: string,
	description: string,
	defaultValue = "",
) {
	return {
		type: "pin",
		pinType: type,
		default: defaultValue,

		id,
		name,
		description,
	} as Setting<string> & {
		id: Id;
		pinType: "digital" | "analog" | "pwm";
		default: string;
	};
}

/**
 * Advanced TypeScript utility type that converts a settings array to an object type.
 * Maps each setting's ID to its return type, providing compile-time type safety
 * for accessing setting values.
 *
 * @example
 * const settings = [pinSetting("pin", "digital", "Pin", ""), i2cSetting("channel")] as const;
 * type SettingsObject = SettingsToObject<typeof settings>;
 * // Result: { pin: string; channel: number }
 */
export type SettingsToObject<T extends readonly Setting<any>[]> = {
	[K in T[number] as K["id"]]: K["_returnType"];
};
