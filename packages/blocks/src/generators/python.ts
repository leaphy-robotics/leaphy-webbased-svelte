import { PythonGenerator, pythonGenerator } from "blockly/python";
import type { Block } from "blockly";

/**
 * Generator for microPython code from blockly blocks, based
 * on blockly's Python generator.
 */

// Round three: "best" of both worlds. The `definitions_` field is protected,
// so make a descendant class of the python generator that adds ways to access
// this field, then "promote" the default Python generator to the new class by
// moving its contents into an instance of the new class.

export class MicroPythonGenerator extends PythonGenerator {
	private i2c_stack_ : number[] | null = null;

	need_i2c_switch_ = false;
	i2c_channel_clean_ = true;

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

	public startI2cBlock(pin_no:number) {
		this.i2c_stack_?.push(pin_no);
	}

	public endI2cBlock() {
		this.i2c_stack_?.pop();
	}

	public currentI2cPin(): number|null {
		if (this.i2c_stack_ == null || this.i2c_stack_?.length === 0) {
			return null
		}
		return this.i2c_stack_[this.i2c_stack_.length-1];
	}

	public scrub_(block: Block, code: string, thisOnly?: boolean): string {
		console.log(`scrubbing ${code}`);
		if (this.need_i2c_switch_ && 
			(block.nextConnection != null || block.previousConnection != null) && 
			(this.i2c_stack_ && this.i2c_stack_.length > 0)) {
			this.addImport("utils.i2c_helper","select_channel");
			this.addImport("machine","I2C")
			this.addDefinition("I2C","i2c_object = I2C()");
			code = `select_channel(i2c_object, MULTIPLEXER_ADDRESS, ${this.currentI2cPin() || ""})\n${code}`;
			this.need_i2c_switch_ = false;
			return code;
		}
		return super.scrub_(block,code,thisOnly);
	}

	public finish(code: string): string {
		console.log("Finishing up.");
		return super.finish(code);
	}
}

// TODO: find a less fragile way to do this.
const microPythonGenerator = new MicroPythonGenerator();
Object.entries(pythonGenerator).forEach((fieldValue) => {
	(microPythonGenerator as any)[fieldValue[0]] = fieldValue[1];
});

import * as operators from "./python/operators";
import * as python_blocks from "./python/python";
import { Workspace } from "blockly";
import * as situation from "./python/situation";
import * as sensors from "./python/sensors";

operators.default(microPythonGenerator);
python_blocks.default(microPythonGenerator);
situation.default(microPythonGenerator);
sensors.default(microPythonGenerator);

export default microPythonGenerator;
