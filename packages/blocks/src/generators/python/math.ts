import { Python } from "../python";
import { Order } from "blockly/python";

function getCodeGenerators(python:Python) {
    python.forBlock["math_number"] = (block,generator) => {
        let code = block.getFieldValue("NUM");
        const val = Number.parseFloat(code);
        if (val === Number.POSITIVE_INFINITY) {
            code = "float('inf')";
        } else if (val === Number.NEGATIVE_INFINITY) {
            code = "float('-inf')";
        }
        return [code, Order.ATOMIC];
    }
}

export default getCodeGenerators;