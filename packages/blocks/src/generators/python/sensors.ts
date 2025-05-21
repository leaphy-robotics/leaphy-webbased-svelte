import { Order } from "blockly/python";
import type { MicroPythonGenerator } from "../python";

/**
 * Block definitions for the BKY_LEAPHY_SENSORS_CATEGORY toolbox-category.
 * Includes controls for the i2c interface, and sensor readouts.
 */

function getCodeGenerators(python:MicroPythonGenerator) {
    python.forBlock.i2c_use_channel = (block, generator) => {
        const channel = block.getFieldValue("CHANNEL") || -1;
        if (channel === -1) {
            return null; //something went horribly wrong.
        }
        generator.startI2cBlock(channel);
        //In order to "smartly" insert channel switches, will have to manually
        // step through the statement and search for any blocks that access the
        // I2C interface.
        const statements = block.getInputTargetBlock("DO");
        const code = generator.blockToCode(statements,false);

        generator.endI2cBlock();

        generator.addImport("utils.i2c_helper","select_channel");
        generator.addDefinition("const_multiplexer_address","MULTIPLEXER_ADDRESS = 0x70");
        return code;
    }

    python.forBlock.leaphy_sonar_read = (block, generator) => {
        generator.addImport("leaphymicropython.sensors.sonar","read_distance");

        const trigger = block.getFieldValue("TRIG_PIN") || 17;
        const echo = block.getFieldValue("ECHO_PIN") || 16;

        return [`read_distance(${trigger},${echo})`, Order.FUNCTION_CALL];
    };
};

export default getCodeGenerators;