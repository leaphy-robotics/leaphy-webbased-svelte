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
	public addDefinition(definitionName: string, definitionContent: string) {
		this.definitions_[definitionName] = definitionContent;
	}

	public addImport(packageName: string, memberName: string) {
		const def_key = `import_${packageName}`;
		let current_import: string = this.definitions_[def_key] || "";
		if (current_import === "") {
			this.definitions_[def_key] = `from ${packageName} import ${memberName}`;
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
}

// TODO: find a less fragile way to do this.
const microPythonGenerator = new MicroPythonGenerator();
Object.entries(pythonGenerator).forEach((fieldValue) => {
	(microPythonGenerator as any)[fieldValue[0]] = fieldValue[1];
});

import * as operators from "./python/operators";
import * as python_blocks from "./python/python";
import * as situation from "./python/situation";

python_blocks.default(microPythonGenerator);
situation.default(microPythonGenerator);
operators.default(microPythonGenerator);

export default microPythonGenerator;
