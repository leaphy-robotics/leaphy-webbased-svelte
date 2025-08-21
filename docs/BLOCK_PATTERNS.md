# Block Types and Patterns

This document provides detailed patterns and examples for different types of blocks you might want to create.

## Block Types Overview

### 1. Value Blocks (Output Blocks)
Blocks that return a value and can be connected to input sockets.

```typescript
{
    type: "my_value_block",
    message0: "%{BKY_MY_VALUE_BLOCK}",
    output: "Number", // or "Boolean", "String"
    style: "leaphy_blocks",
}
```

### 2. Statement Blocks (Command Blocks)
Blocks that perform actions and can be connected in sequences.

```typescript
{
    type: "my_statement_block",
    message0: "%{BKY_MY_STATEMENT_BLOCK} %1",
    args0: [
        {
            type: "input_value",
            name: "VALUE",
            check: "Number",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    style: "leaphy_blocks",
}
```

### 3. Hat Blocks (Event Blocks)
Blocks that start a sequence (like setup or loop blocks).

```typescript
{
    type: "my_hat_block", 
    message0: "%{BKY_MY_HAT_BLOCK}",
    nextStatement: null,
    style: "leaphy_blocks",
}
```

## Common Patterns

### Pin Selector Pattern

For blocks that need Arduino pin selection:

```typescript
// Block definition
{
    type: "my_pin_block",
    message0: "%{BKY_MY_PIN_BLOCK} %1",
    args0: [
        {
            type: "field_pin_selector",
            name: "PIN", 
            mode: "digital", // or "analog" or "pwm"
        },
    ],
    output: "Number",
    style: "leaphy_blocks",
}

// Code generator
arduino.forBlock.my_pin_block = (block) => {
    const pin = block.getFieldValue("PIN");
    
    // Reserve the pin to prevent conflicts
    arduino.reservePin(block, pin, arduino.PinTypes.INPUT, "my_pin_block");
    
    return [`digitalRead(${pin})`, arduino.ORDER_ATOMIC];
};
```

### Dropdown Selection Pattern

For blocks with predefined options:

```typescript
const myOptions = [
    ["%{BKY_OPTION_1}", "1"],
    ["%{BKY_OPTION_2}", "2"], 
    ["%{BKY_OPTION_3}", "3"],
];

// Block definition
{
    type: "my_dropdown_block",
    message0: "%{BKY_MY_DROPDOWN_BLOCK} %1",
    args0: [
        {
            type: "field_dropdown",
            name: "OPTION",
            options: myOptions,
        },
    ],
    output: "Number",
    style: "leaphy_blocks",
}

// Code generator
arduino.forBlock.my_dropdown_block = (block) => {
    const option = block.getFieldValue("OPTION");
    
    let code = "";
    switch (option) {
        case "1":
            code = "doOption1()";
            break;
        case "2": 
            code = "doOption2()";
            break;
        case "3":
            code = "doOption3()";
            break;
    }
    
    return [code, arduino.ORDER_ATOMIC];
};
```

### Multi-Input Pattern

For blocks that accept multiple values:

```typescript
// Block definition
{
    type: "my_multi_input_block",
    message0: "%{BKY_MY_MULTI_INPUT_BLOCK} %1 %{BKY_AND} %2",
    args0: [
        {
            type: "input_value",
            name: "INPUT1",
            check: "Number",
        },
        {
            type: "input_value", 
            name: "INPUT2",
            check: "Number",
        },
    ],
    inputsInline: true, // Show inputs on same line
    output: "Number",
    style: "leaphy_blocks",
}

// Code generator
arduino.forBlock.my_multi_input_block = (block) => {
    const value1 = arduino.valueToCode(block, "INPUT1", arduino.ORDER_ATOMIC) || "0";
    const value2 = arduino.valueToCode(block, "INPUT2", arduino.ORDER_ATOMIC) || "0";
    
    const code = `(${value1} + ${value2})`;
    return [code, arduino.ORDER_ADDITIVE];
};
```

### Conditional Pattern

For blocks with conditional inputs:

```typescript
// Block definition
{
    type: "my_conditional_block",
    message0: "%{BKY_IF} %1",
    message1: "%{BKY_DO} %1", 
    args0: [
        {
            type: "input_value",
            name: "CONDITION",
            check: "Boolean",
        },
    ],
    args1: [
        {
            type: "input_statement",
            name: "DO",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    style: "leaphy_blocks",
}

// Code generator  
arduino.forBlock.my_conditional_block = (block) => {
    const condition = arduino.valueToCode(block, "CONDITION", arduino.ORDER_NONE) || "false";
    const doCode = arduino.statementToCode(block, "DO");
    
    const code = `if (${condition}) {\n${doCode}}\n`;
    return code;
};
```

## Device-Specific Patterns

### Initialization Pattern

Most devices need an initialization block:

```typescript
// Block definition
{
    type: "my_device_init",
    message0: "%{BKY_MY_DEVICE_INIT} %1 %2",
    args0: [
        { type: "field_pin_selector", name: "PIN1", mode: "digital" },
        { type: "field_pin_selector", name: "PIN2", mode: "digital" },
    ],
    previousStatement: null,
    nextStatement: null,
    style: "leaphy_blocks",
}

// Code generator
arduino.forBlock.my_device_init = (block) => {
    const pin1 = block.getFieldValue("PIN1");
    const pin2 = block.getFieldValue("PIN2");
    
    // Add library dependency
    arduino.addDependency(Dependencies.MY_DEVICE_LIB);
    
    // Add includes
    arduino.addInclude("my_device", "#include <MyDevice.h>");
    
    // Add global declaration
    arduino.addDeclaration("my_device", `MyDevice device(${pin1}, ${pin2});`);
    
    // Add setup code
    arduino.addSetup("my_device", "device.begin();");
    
    return "";
};
```

### Sensor Reading Pattern

For reading sensor values:

```typescript
// Block definition
{
    type: "my_sensor_read",
    message0: "%{BKY_MY_SENSOR_READ}",
    output: "Number",
    style: "leaphy_blocks",
}

// Code generator
arduino.forBlock.my_sensor_read = (block) => {
    // Ensure device is initialized
    const code = "device.readValue()";
    return [code, arduino.ORDER_ATOMIC];
};
```

### Actuator Control Pattern

For controlling actuators:

```typescript
// Block definition
{
    type: "my_actuator_set",
    message0: "%{BKY_MY_ACTUATOR_SET} %1",
    args0: [
        {
            type: "input_value",
            name: "VALUE", 
            check: "Number",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    style: "leaphy_blocks",
}

// Code generator
arduino.forBlock.my_actuator_set = (block) => {
    const value = arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
    return `device.setValue(${value});\n`;
};
```

## Robot-Specific Patterns

### Robot Type Detection

Some blocks behave differently based on the robot type:

```typescript
arduino.forBlock.my_robot_specific_block = (block) => {
    let code = "";
    
    if (arduino.robotType.includes("nano")) {
        code = "// Nano-specific code";
    } else if (arduino.robotType.includes("esp32")) {
        code = "// ESP32-specific code";  
    } else {
        code = "// Default Arduino code";
    }
    
    return code;
};
```

### Pin Mapping by Robot

Different robots may use different pins:

```typescript
arduino.forBlock.my_robot_pin_block = (block) => {
    let ledPin = "";
    
    switch (arduino.robotType) {
        case "l_flitz_nano":
            ledPin = "11";
            break;
        case "l_flitz":  
            ledPin = "3";
            break;
        default:
            ledPin = "13";
    }
    
    return `digitalWrite(${ledPin}, HIGH);\n`;
};
```

## I2C Device Pattern

For devices that communicate over I2C:

```typescript
arduino.forBlock.my_i2c_device_init = (block) => {
    const setupCode = `
        if (!myI2CDevice.begin(0x48)) {
            Serial.println(F("Failed to initialize I2C device"));
        }
    `;
    
    arduino.addDependency(Dependencies.MY_I2C_LIB);
    arduino.addInclude("my_i2c_device", "#include <MyI2CDevice.h>");
    arduino.addDeclaration("my_i2c_device", "MyI2CDevice myI2CDevice;");
    
    // Use I2C setup helper for multi-channel support
    const setup = arduino.addI2CSetup("my_i2c_device", setupCode);
    
    return "";
};

arduino.forBlock.my_i2c_device_read = (block) => {
    const code = "myI2CDevice.readValue()";
    return [code, arduino.ORDER_ATOMIC];
};
```

## Advanced Patterns

### Variable Type Checking

For blocks that work with different data types:

```typescript
arduino.forBlock.my_typed_block = (block) => {
    const input = block.getInput("VALUE");
    const connection = input?.connection?.targetConnection;
    const type = connection?.getCheck()?.[0] || "Number";
    
    let code = "";
    switch (type) {
        case "String":
            code = "processString(value)";
            break;
        case "Boolean":
            code = "processBoolean(value)";
            break;
        default:
            code = "processNumber(value)";
    }
    
    return [code, arduino.ORDER_ATOMIC];
};
```

### Custom Field Types

For specialized input fields:

```typescript
// In block definition
{
    type: "my_custom_field_block",
    message0: "%{BKY_MY_CUSTOM_FIELD_BLOCK} %1",
    args0: [
        {
            type: "field_colour", // Built-in color picker
            name: "COLOR",
            colour: "#ff0000",
        },
    ],
    // Or for custom fields:
    // {
    //     type: "field_custom_selector",
    //     name: "CUSTOM",
    // },
    previousStatement: null,
    nextStatement: null,
    style: "leaphy_blocks",
}
```

### Error Handling Pattern

For blocks that might fail:

```typescript
arduino.forBlock.my_error_handling_block = (block) => {
    const value = arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
    
    // Check for valid range
    if (value === "0") {
        block.setWarningText("Value cannot be zero");
    } else {
        block.setWarningText(null);
    }
    
    const code = `
        if (${value} > 0) {
            doSomething(${value});
        } else {
            Serial.println(F("Invalid value"));
        }
    `;
    
    return code;
};
```

## Best Practices

1. **Use meaningful block types**: `device_action` format
2. **Provide helpful tooltips**: Add `tooltip` property to blocks  
3. **Include help URLs**: Link to documentation
4. **Handle edge cases**: Check for valid inputs
5. **Use appropriate precedence**: Return correct `ORDER_*` values
6. **Reserve pins when needed**: Prevent conflicts
7. **Add setup code only when needed**: Use conditional setup
8. **Group related blocks**: Keep device blocks together
9. **Follow naming conventions**: Be consistent with existing patterns
10. **Test thoroughly**: Verify generated code works

## Debugging Tips

- Use `console.log()` in generators to debug values
- Check the generated Arduino code in the interface
- Verify block connections work as expected
- Test with different robot types
- Ensure translations display correctly
- Check that dependencies are correctly specified