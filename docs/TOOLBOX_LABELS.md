# Toolbox Labels Feature

## Overview

This document describes the toolbox labels feature that allows you to organize blocks into labeled sections within toolbox categories.

## What Are Toolbox Labels?

Toolbox labels are text headers that appear in the Blockly toolbox to help organize and group related blocks. They make it easier for users to find specific blocks by creating visual sections within a category.

## Usage

### Basic Label Definition

To add a label in the toolbox, include an object with `kind: "label"` in your toolbox groups:

```typescript
{
    kind: "label",
    text: "Section Name",
    robots: [...robotGroups.ALL],
}
```

### Label Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| `kind` | Yes | `"label"` | Identifies this as a label (not a block) |
| `text` | Yes | `string` | The text to display in the label |
| `robots` | No | `RobotType[]` | Array of robot types this label should appear for |
| `cssClass` | No | `string` | Optional CSS class for custom styling |

### Complete Example

Here's a complete example showing labels in the sensors category:

```typescript
{
    name: "%{BKY_SENSOREN_CATEGORY}",
    style: "leaphy_category",
    id: "l_sensors",
    robots: [...robotGroups.ALL, RobotType.L_MICROPYTHON],
    groups: [
        [
            {
                kind: "label",
                text: "Basic I/O",
                robots: [...robotGroups.ALL, RobotType.L_MICROPYTHON],
            },
            {
                type: "digital_read",
                robots: [...robotGroups.ALL, RobotType.L_MICROPYTHON],
            },
            {
                type: "analog_read",
                robots: [...robotGroups.ALL, RobotType.L_MICROPYTHON],
            },
        ],
        [
            {
                kind: "label",
                text: "Distance Sensors",
                robots: [...robotGroups.ALL],
            },
            {
                type: "leaphy_sonar_read",
                fields: { TRIG_PIN: "7", ECHO_PIN: "8" },
                robots: [...robotGroups.ALL],
            },
            {
                type: "leaphy_tof_get_distance",
                robots: [...robotGroups.ALL, RobotType.L_MICROPYTHON],
            },
        ],
    ],
}
```

## Implementation Details

### How It Works

1. Labels are defined in `packages/client/src/lib/domain/blockly/toolbox.ts` alongside block definitions
2. The `loadToolbox` function in `packages/client/src/lib/domain/blockly/blockly.ts` processes the toolbox configuration
3. When a label is detected (by checking `item.kind === "label"`), it's converted to Blockly's label format
4. Labels are filtered by robot type just like blocks, so they only appear for compatible robots

### Code Flow

```typescript
// In loadToolbox function:
result.contents = category.groups.flatMap((group) => {
    return group
        .filter(({ robots }) => (robots ? inFilter(robot, robots) : true))
        .flatMap((item) => {
            // Handle labels separately from blocks
            if (item.kind === "label") {
                return [
                    { kind: "sep", gap: "8" },
                    { kind: "label", text: item.text, "web-class": item.cssClass || "" },
                ];
            }
            // Default to block handling
            return [
                { kind: "sep", gap: "8" },
                { kind: "block", ...item },
            ];
        })
        .slice(1);
});
```

## Examples in the Codebase

The following categories now use labels for better organization:

### Sensors Category
- **Basic I/O**: Groups digital_read and analog_read blocks

### Actuators Category
- **Motors & Sound**: Groups motor, buzzer, and serial print blocks
- **LED Strips**: Groups LED strip configuration and control blocks
- **OLED Display (Small)**: Groups small OLED display blocks
- **OLED Display (Large)**: Groups large OLED display blocks

## Best Practices

1. **Use Descriptive Names**: Label text should clearly describe the grouped blocks
   - Good: "Distance Sensors", "Motor Control"
   - Bad: "Misc", "Other"

2. **Group Related Blocks**: Place the label before the blocks it describes
   ```typescript
   [
       { kind: "label", text: "LED Control" },
       { type: "led_on" },
       { type: "led_off" },
       { type: "led_brightness" },
   ]
   ```

3. **Consider Robot Compatibility**: Set the `robots` filter to match the blocks in the section
   ```typescript
   {
       kind: "label",
       text: "ESP32 Only Features",
       robots: robotGroups.L_ESP32_ALL,
   }
   ```

4. **Don't Overuse Labels**: Too many labels can clutter the toolbox
   - Use labels for sections with 3+ related blocks
   - Avoid labels for single blocks

5. **Keep Labels Short**: Aim for 1-4 words when possible

## Custom Styling

You can add custom CSS styling to labels using the `cssClass` property:

```typescript
{
    kind: "label",
    text: "Advanced Features",
    cssClass: "advanced-label",
}
```

Then define the style in your CSS:

```css
.advanced-label {
    font-weight: bold;
    color: #ff6600;
}
```

## Benefits

- **Improved Organization**: Makes it easier to find related blocks
- **Better User Experience**: Reduces cognitive load when browsing the toolbox
- **Contextual Grouping**: Helps users understand which blocks work together
- **Scalability**: Keeps the toolbox organized as more blocks are added

## Future Enhancements

Potential improvements to consider:

- Collapsible label sections
- Icon support for labels
- Internationalization (i18n) support for label text using `%{BKY_*}` format
- Tooltip support for labels to provide additional context

