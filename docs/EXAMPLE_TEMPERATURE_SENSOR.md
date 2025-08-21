# Example: Adding a Temperature Sensor Block

This is a complete walkthrough showing how to add a temperature sensor block to Leaphy Webbased Svelte. This example demonstrates the entire process from start to finish.

## Scenario

We want to add support for a simple analog temperature sensor that:
- Reads an analog value from a pin
- Converts it to temperature in Celsius
- Can be used in any program

## Step 1: Define the Block

We'll add this to the existing `leaphy_common.ts` file since it's a common sensor.

Add this block definition to `packages/blocks/src/blocks/leaphy_common.ts`:

```typescript
{
    type: "leaphy_temperature_sensor",
    message0: "%{BKY_LEAPHY_TEMPERATURE_SENSOR} %1",
    args0: [
        {
            type: "field_pin_selector",
            name: "PIN",
            mode: "analog",
        },
    ],
    output: "Number",
    style: "leaphy_blocks",
    helpUrl: "https://www.leaphyfoundation.com/tutorials-leaphy-electronics.html",
    tooltip: "%{BKY_LEAPHY_TEMPERATURE_SENSOR_TIP}",
},
```

## Step 2: Create the Code Generator

Add this to `packages/blocks/src/generators/arduino/variable_blocks.ts`:

```typescript
arduino.forBlock.leaphy_temperature_sensor = (block) => {
    const pin = block.getFieldValue("PIN");
    
    // Reserve the pin to prevent conflicts
    arduino.reservePin(block, pin, arduino.PinTypes.INPUT, "temperature_sensor");
    
    // Add setup code to configure the pin
    arduino.addSetup("temperature_sensor", `pinMode(${pin}, INPUT);`);
    
    // Generate code that converts analog reading to temperature
    // Formula: Temperature = (analogRead(pin) * 5.0 / 1024.0 - 0.5) * 100
    const code = `((analogRead(${pin}) * 5.0 / 1024.0 - 0.5) * 100.0)`;
    
    return [code, arduino.ORDER_MULTIPLICATIVE];
};
```

## Step 3: Add Translations

Add these translations to `packages/blocks/src/msg/translations/en.ts`:

```typescript
messages.LEAPHY_TEMPERATURE_SENSOR = "Read temperature sensor pin";
messages.LEAPHY_TEMPERATURE_SENSOR_TIP = "Read temperature in Celsius from analog temperature sensor";
```

Add these translations to `packages/blocks/src/msg/translations/nl.ts`:

```typescript
messages.LEAPHY_TEMPERATURE_SENSOR = "Lees temperatuur sensor pin";
messages.LEAPHY_TEMPERATURE_SENSOR_TIP = "Lees temperatuur in Celsius van analoge temperatuur sensor";
```

## Step 4: Test the Implementation

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Test the block**:
   - Navigate to the Leaphy interface
   - Look for the new temperature sensor block in the sensors category
   - Drag it into the workspace
   - Connect it to a "Show on screen" block
   - Check the generated Arduino code

3. **Verify the generated code**:
   ```cpp
   // Setup section should include:
   pinMode(A0, INPUT);
   
   // Loop section should include:
   Serial.println(((analogRead(A0) * 5.0 / 1024.0 - 0.5) * 100.0));
   ```

## Step 5: Test Different Scenarios

### Test with different pins:
- Try using different analog pins (A0, A1, A2, etc.)
- Verify the generated code uses the correct pin

### Test language switching:
- Switch between English and Dutch
- Verify both translations appear correctly

### Test pin conflicts:
- Try using the same pin for multiple sensors
- Verify that appropriate warnings appear

## Step 6: Validate with Linter

Run the linter to ensure code quality:

```bash
pnpm biome check packages/blocks
```

## Result

After following these steps, you'll have:

1. ✅ A new temperature sensor block in the toolbox
2. ✅ Proper Arduino code generation
3. ✅ Multi-language support
4. ✅ Pin conflict detection
5. ✅ Helpful tooltip and documentation

## Generated Arduino Code Example

When you use the temperature sensor block with pin A0 and display it on the serial monitor, the generated code would look like:

```cpp
void setup() {
  Serial.begin(115200);
  pinMode(A0, INPUT);
}

void loop() {
  Serial.println(((analogRead(A0) * 5.0 / 1024.0 - 0.5) * 100.0));
}
```

## Extending the Example

You could extend this example by:

1. **Adding a Fahrenheit conversion block**:
   ```typescript
   {
       type: "leaphy_temperature_fahrenheit",
       message0: "%{BKY_LEAPHY_TEMPERATURE_FAHRENHEIT} %1",
       args0: [
           {
               type: "input_value",
               name: "CELSIUS",
               check: "Number",
           },
       ],
       output: "Number",
       style: "leaphy_blocks",
   }
   ```

2. **Adding temperature comparison blocks**:
   ```typescript
   {
       type: "leaphy_temperature_compare",
       message0: "%{BKY_LEAPHY_TEMPERATURE_COMPARE} %1 %2 %3",
       args0: [
           { type: "input_value", name: "TEMP1", check: "Number" },
           { type: "field_dropdown", name: "OP", options: [["<", "LT"], [">", "GT"], ["=", "EQ"]] },
           { type: "input_value", name: "TEMP2", check: "Number" },
       ],
       output: "Boolean",
       style: "leaphy_blocks",
   }
   ```

3. **Adding calibration options**:
   ```typescript
   {
       type: "leaphy_temperature_calibrated",
       message0: "%{BKY_LEAPHY_TEMPERATURE_CALIBRATED} %1 %{BKY_OFFSET} %2",
       args0: [
           { type: "field_pin_selector", name: "PIN", mode: "analog" },
           { type: "field_number", name: "OFFSET", value: 0 },
       ],
       output: "Number",
       style: "leaphy_blocks",
   }
   ```

This example demonstrates the complete workflow and shows how easy it is to add new functionality to the Leaphy block system!