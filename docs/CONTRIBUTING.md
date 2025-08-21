# Contributing Guide: Adding Blocks and Devices

This guide helps new contributors add blocks and devices to Leaphy Webbased Svelte.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding the Architecture](#understanding-the-architecture)
3. [Adding a New Block](#adding-a-new-block)
4. [Adding a New Device](#adding-a-new-device)
5. [Translation Requirements](#translation-requirements)
6. [Testing and Validation](#testing-and-validation)
7. [Examples](#examples)

## Quick Start

To add a new block or device, you'll typically need to modify files in these locations:

```
packages/blocks/src/
├── blocks/           # Block definitions (visual appearance)
├── generators/       # Code generation (Arduino/Python output)
└── msg/translations/ # Text translations (Dutch/English)
```

## Understanding the Architecture

### Block System Overview

The Leaphy block system is built on [Blockly](https://blockly.games/) and consists of:

1. **Block Definitions**: Define how blocks look and behave in the visual editor
2. **Code Generators**: Convert blocks to Arduino C++ or Python code
3. **Translations**: Multi-language support for block text
4. **Dependencies**: External libraries required for generated code

### File Structure

```
packages/blocks/src/
├── blocks/
│   ├── blocks.ts              # Main registry of all blocks
│   ├── leaphy_flitz.ts        # Flitz robot specific blocks
│   ├── leaphy_common.ts       # Common sensor/actuator blocks
│   ├── arduino.ts             # Basic Arduino blocks
│   └── ...
├── generators/
│   ├── arduino.ts             # Main Arduino generator setup
│   └── arduino/
│       ├── dependencies.ts    # Library dependencies
│       ├── leaphy_flitz.ts    # Flitz code generators
│       ├── variable_blocks.ts # Common device generators
│       └── ...
└── msg/translations/
    ├── en.ts                  # English translations
    └── nl.ts                  # Dutch translations
```

## Adding a New Block

Follow these steps to add a simple new block:

### Step 1: Define the Block

Create or edit a file in `packages/blocks/src/blocks/`. For example, to add a new sensor block to `leaphy_common.ts`:

```typescript
{
    type: "leaphy_my_sensor_read",
    message0: "%{BKY_LEAPHY_MY_SENSOR_READ} %1",
    args0: [
        {
            type: "field_pin_selector",
            name: "PIN",
            mode: "analog",
        },
    ],
    output: "Number",
    style: "leaphy_blocks",
    helpUrl: "https://example.com/my-sensor-docs",
}
```

### Step 2: Add Code Generator

Create or edit the corresponding generator file in `packages/blocks/src/generators/arduino/`. For example, in `variable_blocks.ts`:

```typescript
arduino.forBlock.leaphy_my_sensor_read = (block) => {
    const pin = block.getFieldValue("PIN");
    
    // Add any required setup code
    arduino.addSetup("my_sensor", `pinMode(${pin}, INPUT);`);
    
    // Generate the code that will be inserted
    const code = `analogRead(${pin})`;
    
    // Return code with precedence level
    return [code, arduino.ORDER_ATOMIC];
};
```

### Step 3: Add Translations

Add translation keys to both `packages/blocks/src/msg/translations/en.ts` and `nl.ts`:

```typescript
// en.ts
messages.LEAPHY_MY_SENSOR_READ = "Read my sensor pin";

// nl.ts  
messages.LEAPHY_MY_SENSOR_READ = "Lees mijn sensor pin";
```

### Step 4: Register the Block

The block should be automatically registered if you added it to an existing file that's already imported in `packages/blocks/src/blocks/blocks.ts`.

## Adding a New Device

Adding a complete new device involves creating multiple related blocks. Follow this example:

### Step 1: Create Block Definition File

Create `packages/blocks/src/blocks/my_device.ts`:

```typescript
import type { BlockDefinition } from "blockly/core/blocks";

const blocks: BlockDefinition = [
    {
        type: "my_device_init",
        message0: "%{BKY_MY_DEVICE_INIT} %1 %2",
        args0: [
            {
                type: "field_pin_selector", 
                name: "DATA_PIN",
                mode: "digital",
            },
            {
                type: "field_pin_selector",
                name: "CLOCK_PIN", 
                mode: "digital",
            },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "leaphy_blocks",
        helpUrl: "https://example.com/my-device",
    },
    {
        type: "my_device_read",
        message0: "%{BKY_MY_DEVICE_READ}",
        output: "Number",
        style: "leaphy_blocks",
        helpUrl: "https://example.com/my-device",
    },
    {
        type: "my_device_write",
        message0: "%{BKY_MY_DEVICE_WRITE} %1",
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
        helpUrl: "https://example.com/my-device",
    },
];

export { blocks };
```

### Step 2: Create Code Generator File

Create `packages/blocks/src/generators/arduino/my_device.ts`:

```typescript
import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";

function getCodeGenerators(arduino: Arduino) {
    arduino.forBlock.my_device_init = (block) => {
        const dataPin = block.getFieldValue("DATA_PIN");
        const clockPin = block.getFieldValue("CLOCK_PIN");
        
        // Add required dependencies
        arduino.addDependency(Dependencies.MY_DEVICE_LIB);
        
        // Add includes
        arduino.addInclude("my_device", "#include <MyDevice.h>");
        
        // Add declarations
        arduino.addDeclaration(
            "my_device",
            `MyDevice myDevice(${dataPin}, ${clockPin});`
        );
        
        // Add setup code
        arduino.addSetup("my_device", "myDevice.begin();");
        
        return "";
    };

    arduino.forBlock.my_device_read = () => {
        const code = "myDevice.readValue()";
        return [code, arduino.ORDER_ATOMIC];
    };

    arduino.forBlock.my_device_write = (block) => {
        const value = arduino.valueToCode(block, "VALUE", arduino.ORDER_ATOMIC) || "0";
        return `myDevice.writeValue(${value});\n`;
    };
}

export default getCodeGenerators;
```

### Step 3: Add Dependencies

If your device requires external libraries, add them to `packages/blocks/src/generators/arduino/dependencies.ts`:

```typescript
export enum Dependencies {
    // ... existing dependencies
    MY_DEVICE_LIB = "MyDeviceLibrary@1.0.0",
}
```

### Step 4: Register New Files

Add your new files to the imports:

In `packages/blocks/src/blocks/blocks.ts`:
```typescript
import * as myDevice from "./my_device";

const blocks = [
    // ... existing blocks
    ...myDevice.blocks,
];
```

In `packages/blocks/src/generators/arduino.ts`:
```typescript
import * as myDevice from "./arduino/my_device";

// ... in the bottom section
myDevice.default(generator);
```

### Step 5: Add All Translations

Add comprehensive translations for all your blocks:

```typescript
// en.ts
messages.MY_DEVICE_INIT = "Initialize my device data pin %1 clock pin %2";
messages.MY_DEVICE_READ = "Read my device value";
messages.MY_DEVICE_WRITE = "Write to my device %1";

// nl.ts
messages.MY_DEVICE_INIT = "Initialiseer mijn apparaat data pin %1 klok pin %2";
messages.MY_DEVICE_READ = "Lees mijn apparaat waarde";
messages.MY_DEVICE_WRITE = "Schrijf naar mijn apparaat %1";
```

## Translation Requirements

### Key Guidelines

1. **Always provide both English and Dutch translations**
2. **Use descriptive keys**: `LEAPHY_DEVICE_ACTION` format
3. **Keep text concise** but descriptive
4. **Use %1, %2, etc.** for parameter placeholders
5. **Be consistent** with existing terminology

### Common Translation Patterns

| English | Dutch | Usage |
|---------|-------|-------|
| Read | Lees | For sensor inputs |
| Write | Schrijf | For outputs |
| Set | Zet | For configuration |
| Initialize | Initialiseer | For setup blocks |
| Pin | Pin | Pin references |
| Value | Waarde | Data values |
| Sensor | Sensor | Sensor devices |

## Testing and Validation

### Before Submitting

1. **Run the linter**: `pnpm biome check packages/blocks`
2. **Test locally**: `pnpm dev` and test your blocks in the interface
3. **Verify translations**: Check both English and Dutch work correctly
4. **Test generated code**: Ensure the Arduino code compiles
5. **Check dependencies**: Verify required libraries are correctly specified

### Common Issues

- **Missing translations**: Always add both EN and NL
- **Wrong precedence**: Use appropriate `ORDER_*` constants
- **Missing setup**: Don't forget `arduino.addSetup()` for initialization
- **Pin conflicts**: Use `arduino.reservePin()` for exclusive pins
- **Missing dependencies**: Add required libraries to Dependencies enum

## Examples

### Simple Sensor Block

For a basic analog sensor reading:

```typescript
// Block definition
{
    type: "leaphy_light_sensor",
    message0: "%{BKY_LEAPHY_LIGHT_SENSOR} %1",
    args0: [{ type: "field_pin_selector", name: "PIN", mode: "analog" }],
    output: "Number",
    style: "leaphy_blocks",
}

// Code generator
arduino.forBlock.leaphy_light_sensor = (block) => {
    const pin = block.getFieldValue("PIN");
    return [`analogRead(${pin})`, arduino.ORDER_ATOMIC];
};
```

### Complex Device with Multiple Blocks

See the Flitz robot implementation in:
- `packages/blocks/src/blocks/leaphy_flitz.ts`
- `packages/blocks/src/generators/arduino/leaphy_flitz.ts`

This shows patterns for:
- Multiple related blocks
- Robot-specific variations
- Pin configuration management
- RGB LED control

### I2C Device Pattern

For I2C devices, use the I2C helper pattern:

```typescript
arduino.forBlock.my_i2c_device_init = (block) => {
    const setupCode = `
        if (!myI2CDevice.begin()) {
            Serial.println("Failed to initialize device");
        }
    `;
    
    arduino.addDependency(Dependencies.MY_I2C_LIB);
    arduino.addInclude("my_device", "#include <MyI2CDevice.h>");
    arduino.addDeclaration("my_device", "MyI2CDevice myI2CDevice;");
    
    const setup = arduino.addI2CSetup("my_device", setupCode);
    return "";
};
```

### Resources

- [Blockly Documentation](https://developers.google.com/blockly)
- [Arduino Library Management](https://www.arduino.cc/en/guide/libraries)
- [Existing Block Examples](../packages/blocks/src/blocks/)

---

For questions or help, please open an issue on the GitHub repository.