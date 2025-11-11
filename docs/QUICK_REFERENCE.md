# Quick Reference Guide

This is a quick reference for common tasks when adding blocks and devices.

## File Locations Quick Reference

| Task | File Location |
|------|---------------|
| Block definitions | `packages/blocks/src/blocks/*.ts` |
| Code generators | `packages/blocks/src/generators/arduino/*.ts` |
| English translations | `packages/blocks/src/msg/translations/en.ts` |
| Dutch translations | `packages/blocks/src/msg/translations/nl.ts` |
| Dependencies | `packages/blocks/src/generators/arduino/dependencies.ts` |
| Block registry | `packages/blocks/src/blocks/blocks.ts` |
| Generator registry | `packages/blocks/src/generators/arduino.ts` |

## Common Block Properties

### Block Definition Properties

```typescript
{
    type: "unique_block_name",           // Required: Unique identifier
    message0: "%{BKY_TRANSLATION_KEY}",  // Required: Display text
    args0: [...],                        // Optional: Input fields
    output: "Number",                    // For value blocks
    previousStatement: null,             // For statement blocks
    nextStatement: null,                 // For statement blocks
    style: "leaphy_blocks",             // Required: Visual style
    helpUrl: "https://...",             // Optional: Documentation link
    tooltip: "Help text",               // Optional: Hover help
    inputsInline: true,                 // Optional: Layout inputs inline
}
```

### Field Types

| Field Type | Usage | Example |
|------------|-------|---------|
| `field_pin_selector` | Arduino pins | `{ type: "field_pin_selector", name: "PIN", mode: "digital" }` |
| `field_dropdown` | Select options | `{ type: "field_dropdown", name: "OPTION", options: [...] }` |
| `field_number` | Number input | `{ type: "field_number", name: "VALUE", value: 0 }` |
| `field_colour` | Color picker | `{ type: "field_colour", name: "COLOR", colour: "#ff0000" }` |
| `input_value` | Value socket | `{ type: "input_value", name: "VALUE", check: "Number" }` |
| `input_statement` | Statement socket | `{ type: "input_statement", name: "DO" }` |
| `input_dummy` | Spacing | `{ type: "input_dummy" }` |

### Pin Selector Modes

| Mode | Usage |
|------|-------|
| `"digital"` | Digital pins (0/1) |
| `"analog"` | Analog pins (A0-A5) |
| `"pwm"` | PWM-capable pins |

## Common Generator Patterns

### Reading Field Values

```typescript
const pinValue = block.getFieldValue("PIN");
const dropdownValue = block.getFieldValue("DROPDOWN");
```

### Reading Input Values

```typescript
const inputValue = arduino.valueToCode(block, "INPUT_NAME", arduino.ORDER_ATOMIC) || "0";
```

### Reading Statement Code

```typescript
const statementCode = arduino.statementToCode(block, "STATEMENT_NAME");
```

### Arduino Generator Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `addInclude()` | Add #include | `arduino.addInclude("servo", "#include <Servo.h>")` |
| `addDependency()` | Add library | `arduino.addDependency(Dependencies.SERVO)` |
| `addDeclaration()` | Add global variable | `arduino.addDeclaration("servo", "Servo myServo;")` |
| `addSetup()` | Add setup code | `arduino.addSetup("servo", "myServo.attach(9);")` |
| `reservePin()` | Reserve pin | `arduino.reservePin(block, pin, "SERVO", "servo")` |

### Return Values

| Block Type | Return Value |
|------------|--------------|
| Value blocks | `[code, precedence]` |
| Statement blocks | `code + "\n"` |
| Hat blocks | `code` |

### Precedence Constants

| Constant | Usage |
|----------|-------|
| `ORDER_ATOMIC` | Highest precedence (function calls, literals) |
| `ORDER_UNARY_PREFIX` | Unary operators (!, -, ~) |
| `ORDER_MULTIPLICATIVE` | Multiplication, division |
| `ORDER_ADDITIVE` | Addition, subtraction |
| `ORDER_RELATIONAL` | Comparison operators |
| `ORDER_LOGICAL_AND` | Logical AND |
| `ORDER_LOGICAL_OR` | Logical OR |
| `ORDER_NONE` | Lowest precedence (needs parentheses) |

## Translation Keys

### Naming Convention

Use format: `BKY_CATEGORY_DEVICE_ACTION`

Examples:
- `BKY_LEAPHY_SERVO_WRITE`
- `BKY_LEAPHY_SENSOR_READ`
- `BKY_ARDUINO_LED_SET`

### Common Translations

| English | Dutch | Key Pattern |
|---------|-------|-------------|
| Read | Lees | `*_READ` |
| Write | Schrijf | `*_WRITE` |
| Set | Zet | `*_SET` |
| Initialize | Initialiseer | `*_INIT` |
| Pin | Pin | `*_PIN` |
| Value | Waarde | `*_VALUE` |
| Sensor | Sensor | `*_SENSOR` |
| Degrees | Graden | `*_DEGREES` |
| Milliseconds | Milliseconden | `*_MS` |

## Common Dependencies

| Library | Dependency Constant |
|---------|-------------------|
| Servo | `Dependencies.SERVO` |
| ESP32Servo | `Dependencies.ESP_SERVO` |
| SSD1306 OLED | `Dependencies.ADAFRUIT_SSD1306_OLED` |
| Leaphy Extensions | `Dependencies.LEAPHY_EXTENSIONS` |
| SD Card | `Dependencies.SD` |

## Toolbox Configuration

### Adding Blocks to Toolbox

Blocks are added to the toolbox in `packages/client/src/lib/domain/blockly/toolbox.ts`.

```typescript
{
    name: "Category Name",
    style: "leaphy_category",
    id: "category_id",
    robots: [...robotGroups.ALL],
    groups: [
        [
            {
                type: "block_type_name",
                robots: [...robotGroups.ALL],
                inputs: {
                    INPUT_NAME: number(0),
                },
            },
        ],
    ],
}
```

### Using Labels in Toolbox

Labels can be used to organize blocks into sections within a category:

```typescript
{
    kind: "label",
    text: "Section Name",
    robots: [...robotGroups.ALL],
    cssClass: "custom-label-class", // Optional
}
```

**Example:**

```typescript
groups: [
    [
        {
            kind: "label",
            text: "Basic I/O",
            robots: [...robotGroups.ALL],
        },
        {
            type: "digital_read",
            robots: [...robotGroups.ALL],
        },
        {
            type: "analog_read",
            robots: [...robotGroups.ALL],
        },
    ],
]
```

### Toolbox Helper Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `number(value)` | Add number shadow block | `inputs: { NUM: number(0) }` |
| `text(value)` | Add text shadow block | `inputs: { TEXT: text("hello") }` |
| `boolean()` | Add boolean shadow block | `inputs: { BOOL: boolean() }` |

## Testing Checklist

- [ ] Block appears in toolbox
- [ ] Block connects properly 
- [ ] Generated code is valid Arduino C++
- [ ] Both English and Dutch translations work
- [ ] All required dependencies are specified
- [ ] Pin conflicts are handled
- [ ] Setup code is added when needed
- [ ] Help URL works (if provided)
- [ ] Linter passes: `pnpm biome check packages/blocks`

## Common Issues & Solutions

### Block Not Appearing
- Check if block file is imported in `blocks.ts`
- Verify block type is unique
- Check for syntax errors in block definition

### Generated Code Not Working
- Verify all dependencies are added
- Check setup code is properly added
- Ensure includes are correct
- Test precedence with parentheses if needed

### Translation Not Showing  
- Check translation key matches exactly
- Verify both EN and NL translations exist
- Look for typos in translation keys

### Pin Conflicts
- Use `arduino.reservePin()` for exclusive pins
- Check if other blocks use the same pin
- Use appropriate pin types in warnings

### Missing Setup Code
- Add setup code in init blocks
- Use `arduino.addSetup()` with unique keys
- Check setup code runs only once

## File Templates

### New Block File Template

```typescript
import type { BlockDefinition } from "blockly/core/blocks";

const blocks: BlockDefinition = [
    {
        type: "my_new_block",
        message0: "%{BKY_MY_NEW_BLOCK}",
        output: "Number",
        style: "leaphy_blocks",
        helpUrl: "https://example.com/help",
    },
];

export { blocks };
```

### New Generator File Template

```typescript
import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";

function getCodeGenerators(arduino: Arduino) {
    arduino.forBlock.my_new_block = (block) => {
        // Your code generation logic here
        const code = "/* generated code */";
        return [code, arduino.ORDER_ATOMIC];
    };
}

export default getCodeGenerators;
```

## Commands

| Task | Command |
|------|---------|
| Install dependencies | `pnpm install` |
| Run linter | `pnpm biome check packages/blocks` |
| Fix linting issues | `pnpm biome check --write packages/blocks` |
| Start development server | `pnpm dev` |
| Run tests | `pnpm test` |

## Useful VS Code Extensions

- **Blockly Developer Tools**: For Blockly development
- **TypeScript Hero**: For import management
- **Auto Rename Tag**: For HTML/XML editing
- **Bracket Pair Colorizer**: For code readability