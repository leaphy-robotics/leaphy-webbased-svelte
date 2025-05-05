import { PythonGenerator, pythonGenerator } from "blockly/python";

/**
 * Generator for microPython code from blockly blocks, based
 * on blockly's Python generator.
 */

// In order to access the internal definitions_ field where blockly stores definitions,
// the generator needs to be cast to any. Following the pattern used in the main blockly
// repository, such as in https://github.com/google/blockly/blob/develop/generators/python/math.ts#L234
type AnyDuringMigration = any;

/**
 * Adds a new import to the top of the output, trying to format it nicely into something like `from foo import bar, baz, nop`
 * @param generator the generator to receive the import
 * @param package_name the name of the package; the part after `from `
 * @param member_name the item to be imported; the part after `import `
 */
export function registerImport(generator:PythonGenerator,package_name:string,member_name:string) {
    let current_import:string = (generator as AnyDuringMigration).definitions_["import_" + package_name] || "";
    if (current_import == "") {
        (generator as AnyDuringMigration).definitions_["import_" + package_name] = "from " + package_name + " import " + member_name;
    }
    let members = current_import.substring(current_import.indexOf("import ")+7).split(", ").filter((item) => {item != ""});
    if (!members.includes(member_name)) {
        members.push(member_name)
    }
    (generator as AnyDuringMigration).definitions_["import_" + package_name] = "from " + package_name + " import " + members.join(", ");
}

/**
 * Adds a new definition to the output, for instance a new global variable or user-defined function.
 * @param generator the generator to receive the definition
 * @param definition_name the name of the definition (for de-duplication purposes)
 * @param contents the contents of the definition, such as a function's body
 */
export function registerDefinition(generator:PythonGenerator,definition_name:string,contents:string) {
    (generator as AnyDuringMigration).definitions_[definition_name] = contents;
}

const generator = pythonGenerator;

import * as python_blocks from "./python/python";
import * as situation from "./python/situation";

python_blocks.default(generator);
situation.default(generator);

export default generator;
