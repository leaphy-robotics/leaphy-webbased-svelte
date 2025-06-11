import type { Block } from "blockly";
import { PythonGenerator, pythonGenerator } from "blockly/python";

/**
 * Generator for microPython code from blockly blocks, based
 * on blockly's Python generator.
 */

// Round three: "best" of both worlds. The `definitions_` field is protected,
// so make a descendant class of the python generator that adds ways to access
// this field, then "promote" the default Python generator to the new class by
// moving its contents into an instance of the new class.

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
		return super.finish(code);
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
