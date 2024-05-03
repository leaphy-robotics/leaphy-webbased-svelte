import { type FieldConfig, FieldDropdown, type MenuOption } from "blockly";
import { PinMapping, type RobotDevice } from "../robots";

interface PinSelectorOptions extends FieldConfig {
	mode: "digital" | "analog" | "pwm";
}

export default class PinSelectorField extends FieldDropdown {
	static digitalPinOptions: MenuOption[];
	static analogPinOptions: MenuOption[];
	static pwmPinOptions: MenuOption[];

	static processPinMappings(board: RobotDevice) {
		let digitalPinRange: [number, number];
		let analogPinRange: [number, number];

		switch (board.mapping) {
			case PinMapping.UNO: {
				digitalPinRange = [2, 13];
				analogPinRange = [0, 5];
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

			case PinMapping.NANO: {
				digitalPinRange = [2, 13];
				analogPinRange = [0, 7];
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

			case PinMapping.MEGA: {
				digitalPinRange = [2, 53];
				analogPinRange = [0, 15];
				PinSelectorField.pwmPinOptions = [
					["2", "2"],
					["3", "3"],
					["4", "4"],
					["5", "5"],
					["6", "6"],
					["7", "7"],
					["8", "8"],
					["9", "9"],
					["10", "10"],
					["11", "11"],
					["12", "12"],
					["13", "13"],
				];
				break;
			}
		}

		PinSelectorField.digitalPinOptions = [];
		for (let pin = digitalPinRange[0]; pin <= digitalPinRange[1]; pin++) {
			PinSelectorField.digitalPinOptions.push([pin.toString(), pin.toString()]);
		}

		PinSelectorField.analogPinOptions = [];
		for (let pin = analogPinRange[0]; pin <= analogPinRange[1]; pin++) {
			PinSelectorField.analogPinOptions.push([
				`A${pin.toString()}`,
				`A${pin.toString()}`,
			]);
		}
	}

	constructor(options: PinSelectorOptions) {
		switch (options.mode) {
			case "digital": {
				super(PinSelectorField.digitalPinOptions, undefined, options);
				break;
			}
			case "analog": {
				super(PinSelectorField.analogPinOptions, undefined, options);
				break;
			}
			case "pwm": {
				super(PinSelectorField.pwmPinOptions, undefined, options);
				break;
			}
			default: {
				super([], undefined, options);
				break;
			}
		}
	}

	static fromJson(options: PinSelectorOptions) {
		return new PinSelectorField(options);
	}
}
