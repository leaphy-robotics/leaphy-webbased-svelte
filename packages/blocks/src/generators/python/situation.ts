import { Python } from "../python";
import { Order } from "blockly/python";
import { Names } from "blockly";

/********
 * Block definitions for the BKY_LEAPHY_SITUATION_CATEGORY toolbox-category.
 * Includes loops, conditionals and delays.
 */

function getCodeGenerators(python:Python) {
    python.forBlock["time_delay"] = function (block, generator) {
        //Python's sleep expects seconds.
        const delayTime =
            parseInt(
                generator.valueToCode(
                    block,
                    "DELAY_TIME_MILI",
                    Order.ATOMIC,
                ) || "0", 10
            ) / 1000;
        
        generator.registerImports("time", ["sleep"]);
        return "sleep(" + delayTime + ")\n";
    }

    python.forBlock["controls_repeat_forever"] = function (block,generator) {
        let branch = generator.statementToCode(block, "DO");
        branch = generator.addLoopTrap(branch,block);
        return "while True:\n" + branch;
    }

    python.forBlock["controls_repeat_ext"] = function (block,generator) {
        const repeat_count = generator.valueToCode(block,"TIMES",Order.ADDITIVE) || "0";
        let branch = generator.statementToCode(block,"DO");
        branch = generator.addLoopTrap(branch,block);
        let code = "";
        const loopVar = generator.nameDB_?.getDistinctName(
            "count",
            Names.NameType.VARIABLE,
        ) || "_";

        code += "for " + loopVar + " in range(" + repeat_count + "):\n" + branch + "\n";
        return code;
    }
}

export default getCodeGenerators;