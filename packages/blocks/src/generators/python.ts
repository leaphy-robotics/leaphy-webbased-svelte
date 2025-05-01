import { PythonGenerator } from "blockly/python";
import { WorkspaceSvg } from "blockly";

/**
 * Generator for microPython code from blockly blocks, based
 * on blockly's Python generator.
 */
export class Python extends PythonGenerator {

    protected imports_: Record<string,string[]> = {};

    public init(workspace: WorkspaceSvg) {
        this.imports_ = Object.create(null);

        super.init(workspace);
    }

    public finish(code: string) {
        // Convert imports into lines.
        const import_lines = Object.entries(this.imports_)
            .map((line_data) => {
                const members = line_data[1].join(", ");
                return "from " + line_data[0] + " import " + members + "\n";
            })
            .join("\n")
            + "\n";

        const definition_lines = Object.values(this.definitions_)
            .join("\n\n")
            + "\n\n";
        return import_lines + definition_lines + code;
    }

    public registerImports(package_name:string, members:string[]) {
        if (this.imports_[package_name] === undefined) {
            this.imports_[package_name] = [];
        }

        members.forEach((import_member) => {
            if (!this.imports_[package_name].includes(import_member)) {
                this.imports_[package_name].push(import_member);
            }
        })
    }

    public registerDefinition(function_name:string, code:string) {
        this.definitions_[function_name] = code;
    }

}

const generator = new Python();

import * as python_blocks from "./python/python";
import * as math from "./python/math";
import * as situation from "./python/situation";

python_blocks.default(generator);
math.default(generator);
situation.default(generator);

export default generator;
