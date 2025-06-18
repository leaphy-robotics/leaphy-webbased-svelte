import type { Block } from "blockly";
import { PythonGenerator, pythonGenerator } from "blockly/python";

export enum PinState {
	UNASSIGNED = "",
	IN = "IN",
	OUT = "OUT",
	ADC = "ADC",
	PWM = "PWM",
}

const pin_aliases: Record<string, string[]> = {
	D0: ["D0", "TX1"],
	D1: ["D1", "RX0"],
	D2: ["D2"],
	D3: ["D3"],
	D4: ["D4"],
	D5: ["D5"],
	D6: ["D6"],
	D7: ["D7"],
	D8: ["D8"],
	D9: ["D9"],
	D10: ["D10"],
	D11: ["D11"],
	D12: ["D12"],
	D13: ["D13"],
	D14: ["D14", "A0"],
	D15: ["D15", "A1"],
	D16: ["D16", "A2"],
	D17: ["D17", "A3"],
	D18: ["D18", "A4", "SDA"],
	D19: ["D19", "A5", "SCL"],
	A0: ["D14", "A0"],
	A1: ["D15", "A1"],
	A2: ["D16", "A2"],
	A3: ["D17", "A3"],
	A4: ["D18", "A4", "SDA"],
	A5: ["D19", "A5", "SCL"],
	A6: ["A6"],
	A7: ["A7"],
};

export function pin_name_aliases(pin_name: string): string[] | undefined {
	if (pin_name.toUpperCase() in pin_aliases) {
		return pin_aliases[pin_name];
	}
	return [`Unknown pin ${pin_name}`];
}

/**
 * Generator for microPython code from blockly blocks, based
 * on blockly's Python generator.
 */

export class MicroPythonGenerator extends PythonGenerator {
	private i2c_stack_: number[] | null = null;

	private need_i2c_switch_ = false;
	private used_i2c_channels_: boolean[] = [
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
	];
	i2c_channel_clean_ = true;

	private pin_state_: Record<string, PinState> = {};

	public workspaceToCode(workspace?: Workspace, robotType?: string): string {
		return super.workspaceToCode(workspace);
	}

	public init(workspace: Workspace): void {
		super.init(workspace);
		this.i2c_stack_ = [];
		this.need_i2c_switch_ = false;
	}

	public addDefinition(definitionName: string, definitionContent: string) {
		this.definitions_[definitionName] = definitionContent;
	}

	public addImport(packageName: string, memberName: string) {
		const def_key = `import_${packageName}`;
		let current_import: string = this.definitions_[def_key] || "";
		if (current_import === "") {
			this.definitions_[def_key] = `from ${packageName} import ${memberName}`;
			return;
		}
		// 3rd space is after the `import` keyword.
		let part_start = current_import.indexOf(" ", 5) + 1;
		part_start = current_import.indexOf(" ", part_start) + 1;
		let members = current_import
			.substring(part_start)
			.split(", ")
			.map((item) => item.trim())
			.filter((item) => item.length > 0);

		if (!members.includes(memberName)) {
			members.push(memberName);
		}

		this.definitions_[def_key] =
			`from ${packageName} import ${members.join(", ")}`;
	}

	public addI2cSupport(need_multiplexer = true) {
		this.addImport("leaphymicropython.utils.i2c_helper", "select_channel");
		this.addImport("machine", "I2C");
		this.addDefinition(
			"i2c_object",
			`${this.getVariableName("I2C_CONNECTION")} = I2C(0)`,
		);
		if (need_multiplexer) {
			this.addDefinition(
				"const_multiplexer_address",
				"MULTIPLEXER_ADDRESS = 0x70",
			);
		}
	}

	public startI2cBlock(pin_no: number) {
		this.i2c_stack_?.push(pin_no);
	}

	public endI2cBlock() {
		let removedChannel = this.i2c_stack_?.pop() || -1;
		this.i2c_channel_clean_ =
			removedChannel === this.currentI2cChannel() && this.i2c_channel_clean_;
	}

	public insertI2cChannel() {
		if (this.i2c_stack_ && this.i2c_stack_.length > 0) {
			this.addI2cSupport(true);
			this.need_i2c_switch_ = true;
			this.used_i2c_channels_[this.currentI2cChannel() || 0] = true;
		}
	}

	public currentI2cChannel(): number | null {
		if (this.i2c_stack_ == null || this.i2c_stack_?.length === 0) {
			return null;
		}
		return this.i2c_stack_[this.i2c_stack_.length - 1];
	}

	pin_state(pin_name: string): PinState | undefined {
		if (pin_name in pin_aliases) {
			let alias_list = pin_aliases[pin_name];
			let retval = PinState.UNASSIGNED;
			alias_list.forEach((alias) => {
				let alias_state = this.pin_state_[alias];
				if (alias_state !== undefined) {
					retval = alias_state;
				}
			});
			return retval;
		}
		return undefined;
	}

	public reserveDigitalPin(pin_name: string, pin_input: boolean): boolean {
		let current_state = this.pin_state(pin_name);
		let target_state = pin_input ? PinState.IN : PinState.OUT;
		if (current_state === PinState.UNASSIGNED) {
			this.pin_state_[pin_name] = target_state;
			this.addImport("machine", "Pin");
		}
		return this.pin_state_[pin_name] === target_state;
	}

	public reserveAnalogPin(pin_name: string, pin_input: boolean): boolean {
		let current_state = this.pin_state(pin_name);
		if (current_state === PinState.UNASSIGNED) {
			this.pin_state_[pin_name] = pin_input ? PinState.ADC : PinState.PWM;
			this.addImport("machine", "Pin");
			if (pin_input) {
				this.addImport("machine", "ADC");
			} else {
				this.addImport("machine", "PWM");
			}
		}
		return (
			this.pin_state_[pin_name] === (pin_input ? PinState.ADC : PinState.PWM)
		);
	}

	public scrub_(block: Block, code: string, thisOnly?: boolean): string {
		if (this.i2c_channel_clean_) {
			this.need_i2c_switch_ = false;
		}
		if (
			this.need_i2c_switch_ &&
			(block.nextConnection != null || block.previousConnection != null) &&
			this.i2c_stack_ &&
			this.i2c_stack_.length > 0
		) {
			let patchedCode = `select_channel(i2c_object, MULTIPLEXER_ADDRESS, ${this.currentI2cChannel() || ""})\n${code}`;
			this.need_i2c_switch_ = false;
			return patchedCode;
		}
		return super.scrub_(block, code, thisOnly);
	}

	public finish(code: string): string {
		//Sort pin names into a sensible order, before generating the relevant code.
		function pin_sort(left: string, right: string): number {
			let left_i = left.charAt(0);
			let right_i = right.charAt(0);
			if (left_i === "A" && right_i === "D") {
				return -1;
			}
			if (left_i === "D" && right_i === "A") {
				return 1;
			}

			let left_n = Number.parseInt(left.slice(1));
			let right_n = Number.parseInt(right.slice(1));
			return left_n - right_n;
		}
		let pins = Object.keys(this.pin_state_).sort(pin_sort);
		let pin_code = pins
			.map((pin_name) => {
				let pin_state = this.pin_state_[pin_name] || PinState.UNASSIGNED;
				if (pin_state === PinState.UNASSIGNED) {
					return "";
				}
				if (pin_state === PinState.ADC) {
					return `pin_${pin_name.toLowerCase()} = Pin("${pin_name}", Pin.ANALOG)\nadc_${pin_name.toLowerCase()} = ADC(pin_${pin_name.toLowerCase()})\n`;
				}
				if (pin_state === PinState.PWM) {
					return `pin_${pin_name.toLowerCase()} = Pin("${pin_name}", Pin.OUT)\npwm_${pin_name.toLowerCase()} = PWM(pin_${pin_name.toLowerCase()})\n`;
				}
				return `pin_${pin_name.toLowerCase()} = Pin("${pin_name}", Pin.${pin_state})\n`;
			})
			.join("");
		if (pin_code.length > 0) {
			pin_code = `${pin_code}\n`;
			this.addDefinition("pins", pin_code);
		}

		let retval = super.finish(code);

		this.pin_state_ = {};
		return retval;
	}
}

// TODO: find a less fragile way to do this.
const microPythonGenerator = new MicroPythonGenerator();
Object.entries(pythonGenerator).forEach((fieldValue) => {
	(microPythonGenerator as any)[fieldValue[0]] = fieldValue[1];
});

import type { Workspace } from "blockly";
import * as actuators from "./python/actuators";
import * as operators from "./python/operators";
import * as python_blocks from "./python/python";
import * as sensors from "./python/sensors";
import * as situation from "./python/situation";

actuators.default(microPythonGenerator);
operators.default(microPythonGenerator);
python_blocks.default(microPythonGenerator);
sensors.default(microPythonGenerator);
situation.default(microPythonGenerator);

export default microPythonGenerator;
