import { type FieldConfig, FieldDropdown } from "blockly";
import { PinMapping, type RobotDevice } from "../robots";

interface PinSelectorOptions extends FieldConfig {
	mode: "digital" | "analog" | "pwm";
	includeDefault?: boolean;
}

export default class PinSelectorField extends FieldDropdown {
	static digitalPinOptions: [string, string][];
	static analogPinOptions: [string, string][];
	static pwmPinOptions: [string, string][];

	static generatePinRange(
		min: number,
		max: number,
		prefix = "",
		labelMin = min,
		labelPrefix = prefix,
	) {
		let result: [string, string][] = [];
		for (let pin = min; pin <= max; pin++) {
			result.push([
				`${labelPrefix}${(pin - min + labelMin).toString()}`,
				`${prefix}${pin.toString()}`,
			]);
		}

		return result;
	}

	static processPinMappings(board: RobotDevice) {
		switch (board.mapping) {
			case PinMapping.UNIFIED: {
				PinSelectorField.digitalPinOptions = PinSelectorField.generatePinRange(
					2,
					19,
				);
				PinSelectorField.analogPinOptions = PinSelectorField.generatePinRange(
					0,
					7,
					"A",
				);
				PinSelectorField.pwmPinOptions = [
					["3", "3"],
					["5", "5"],
					["6", "6"],
					["9", "9"],
					["10", "10"],
					["11", "11"],
				];
				break;
			}

			case PinMapping.MICROPYTHON: {
				PinSelectorField.digitalPinOptions = [
					...PinSelectorField.generatePinRange(2, 13, "D"),
					...PinSelectorField.generatePinRange(0, 5, "A"),
				];
				PinSelectorField.analogPinOptions = PinSelectorField.generatePinRange(
					0,
					7,
					"A",
				);
				PinSelectorField.pwmPinOptions = PinSelectorField.digitalPinOptions;
				break;
			}

			case PinMapping.MEGA: {
				PinSelectorField.digitalPinOptions = PinSelectorField.generatePinRange(
					2,
					53,
				);
				PinSelectorField.analogPinOptions = PinSelectorField.generatePinRange(
					0,
					15,
					"A",
				);
				PinSelectorField.pwmPinOptions = [
					...PinSelectorField.generatePinRange(2,13),
					...PinSelectorField.generatePinRange(44,46)
					];
				break;
			}
		}
	}

	static getOptions(
		mode: "digital" | "analog" | "pwm",
		includeDefault?: boolean,
	): [string, string][] {
		let options: [string, string][] = [];
		if (includeDefault) {
			options.push(["%{BKY_DEFAULT}", "DEFAULT"]);
		}

		switch (mode) {
			case "digital": {
				options.push(...PinSelectorField.digitalPinOptions);
				break;
			}
			case "analog": {
				options.push(...PinSelectorField.analogPinOptions);
				break;
			}
			case "pwm": {
				options.push(...PinSelectorField.pwmPinOptions);
				break;
			}
		}

		return options;
	}

	constructor(options: PinSelectorOptions) {
		super(
			PinSelectorField.getOptions(options.mode, options.includeDefault),
			undefined,
			options,
		);
	}

	static fromJson(options: PinSelectorOptions) {
		return new PinSelectorField(options);
	}
}
