import {BlockDefinition} from "blockly/core/blocks";

const blocks: BlockDefinition = [
    {
        type: "bluetooth_setup",
        style: "bluetooth_blocks",
        message0: "%{BKY_LEAPHY_BLUETOOTH_SETUP}",
        args0: [
            {
                type: "input_value",
                name: "NAME",
                check: ["String"],
            },
        ],
        previousStatement: null,
        nextStatement: null,
    },
    {
        type: "bluetooth_start_leaphy_filtered_scan",
        style: "bluetooth_blocks",
        message0: "%{BKY_LEAPHY_BLUETOOTH_START_LEAPHY_FILTERED_SCAN}",
        previousStatement: null,
        nextStatement: null,
    },
    {
        type: "bluetooth_start_name_filtered_scan",
        style: "bluetooth_blocks",
        message0: "%{BKY_LEAPHY_BLUETOOTH_START_NAME_FILTERED_SCAN}",
        args0: [
            {
                type: "input_value",
                name: "NAME",
                check: ["String"],
            },
        ],
        previousStatement: null,
        nextStatement: null,
    },
    {
        type: "bluetooth_stop_scan",
        style: "bluetooth_blocks",
        message0: "%{BKY_LEAPHY_BLUETOOTH_STOP_SCAN}",
        previousStatement: null,
        nextStatement: null,
    },
    {
        type: "bluetooth_on_connect",
        style: "bluetooth_blocks",
        message0: "%{BKY_LEAPHY_BLUETOOTH_ON_CONNECT}",
        extensions: ["appendStatementInputStack"],
        nextStatement: null,
    },
    {
        type: "bluetooth_on_disconnect",
        style: "bluetooth_blocks",
        message0: "%{BKY_LEAPHY_BLUETOOTH_ON_DISCONNECT}",
        extensions: ["appendStatementInputStack"],
        nextStatement: null,
    },
    {
        type: "bluetooth_on_discover",
        style: "bluetooth_blocks",
        message0: "%{BKY_LEAPHY_BLUETOOTH_ON_DISCOVER}",
        extensions: ["appendStatementInputStack"],
        nextStatement: null,
    },
    {
        type: "bluetooth_on_characteristic_update",
        style: "bluetooth_blocks",
        message0: "%{BKY_LEAPHY_BLUETOOTH_CHARACTERISTIC_ON_UPDATE}",
        args0: [
            {
                type: "input_value",
                name: "NAME",
                check: ["String"],
            },
        ],
        extensions: ["appendStatementInputStack"],
        nextStatement: null,
    },
    {
        type: "bluetooth_create_binary_characteristic",
        style: "bluetooth_blocks",
        message0: "%{BKY_LEAPHY_BLUETOOTH_CREATE_BINARY_CHARACTERISTIC}",
        args0: [
            {
                type: "input_value",
                name: "NAME",
                check: ["String"],
            },
            { type: "input_value", name: "INITIAL_VALUE", check: "Boolean" },
        ],
        previousStatement: null,
        nextStatement: null,
    },
    {
        type: "bluetooth_create_string_characteristic",
        style: "bluetooth_blocks",
        message0: "%{BKY_LEAPHY_BLUETOOTH_CREATE_STRING_CHARACTERISTIC}",
        args0: [
            {
                type: "input_value",
                name: "NAME",
                check: ["String"],
            },
            { type: "input_value", name: "INITIAL_VALUE", check: "String" },
        ],
        previousStatement: null,
        nextStatement: null,
    },
    {
        type: "bluetooth_read_string_characteristic",
        style: "bluetooth_blocks",
        message0: "%{BKY_LEAPHY_BLUETOOTH_READ_STRING_CHARACTERISTIC}",
        args0: [
            {
                type: "input_value",
                name: "NAME",
                check: ["String"],
            },
        ],
        output: "String",
    },
    {
        type: "bluetooth_read_bool_characteristic",
        style: "bluetooth_blocks",
        message0: "%{BKY_LEAPHY_BLUETOOTH_READ_BINARY_CHARACTERISTIC}",
        args0: [
            {
                type: "input_value",
                name: "NAME",
                check: ["String"],
            },
        ],
        output: "Boolean",
    },
];

export {blocks};
