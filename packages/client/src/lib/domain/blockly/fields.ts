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
				digitalPinRange = [2, 19];
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
				digitalPinRange = [2, 19];
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

			case PinMapping.MICROPYTHON: {
				let range = (start, end) =>
					[...Array(1 + end - start).keys()].map((i) => i + start);
				PinSelectorField.digitalPinOptions = range(2, 12).map((v) => [
					`D${v}`,
					`D${v}`,
				]);
				PinSelectorField.analogPinOptions = range(0, 7).map((v) => [
					`A${v}`,
					`A${v}`,
				]);
				PinSelectorField.pwmPinOptions = [
					["D3", "D3"],
					["D5", "D5"],
					["D6", "D6"],
					["D9", "D9"],
					["D10", "D10"],
					["D11", "D11"],
				];
				return;
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
