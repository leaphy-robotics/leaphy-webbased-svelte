import type { MicroPythonGenerator } from "../python";
import { Order } from "blockly/python";

/**
 * block-definitions for the BKY_LEAPHY_OPERATORS_CATEGORY toolbox-category.
 * Includes mathematical operations, logical comparisons and string manipulations.
 */

function getCodeGenerators(python: MicroPythonGenerator) {
    python.forBlock.text_to_double = (block, generator) => {
        const rawText = generator.valueToCode(block, "VALUE", Order.NONE);

        return [`float(${rawText})`,Order.FUNCTION_CALL];
    };

    python.forBlock.text_join = (block, generator) => {
        const textLeft = generator.valueToCode(block, "ADD0", Order.NONE);
        const textRight = generator.valueToCode(block, "ADD1", Order.NONE);

        return [`str(${textLeft}) + str(${textRight})`, Order.STRING_CONVERSION];
    };

    python.forBlock.text_includes = (block, generator) => {
        const haystack = generator.valueToCode(block, "VALUE", Order.NONE);
        const needle = generator.valueToCode(block, "CHECK", Order.NONE);

        return [`${needle} in ${haystack}`, Order.RELATIONAL];
    }
}

export default getCodeGenerators;
