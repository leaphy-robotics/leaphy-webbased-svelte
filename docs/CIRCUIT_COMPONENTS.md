# Circuit components
This guide will help you to add your own components to our dynamic circuit diagram generator

## Obtaining a fritzing component
Our automatic CLI is able to import fritzing components from .fzpz files, you will need one of these files for this guide, you can also get these from the fritzing application directly, for custom components you can right click and then click export, for bundled fritzing components you can follow these steps:
1. Right click on component -> Click on "edit part (new parts editor)"
2. On the top menu click on file -> Save as new part
3. Give your component a prefix (it doesn't matter)
4. You can now export the part from the my ports tab in the main editor by right-clicking and then export

## Converting fritzing component
You can follow the following procedure to convert and add the component to our schemas library:
1. `cd packages/schemas`
2. `pnpm run add /path/to/fritzing/component.fzpz src/components/my-component`
3. Most of the time you will be able to proceed with the default pin mappings, you can edit these later, just type Y for now
4. Now that you have added the component you will need to export it in `src/components/index.ts`, add the following line: `export { default as MyComponent } from "./my-component";`

## Converting EasyEDA PCB
Boards designed in EasyEDA Standard can be imported as well, the CLI draws them in the same art style as our fritzing components. EasyEDA Pro projects (.epro) aren't supported.

1. Open the PCB in EasyEDA Standard and export its EasyEDA source, this gives you a .json file (.zip files containing multiple documents can also be used)
2. `cd packages/schemas`
3. `pnpm run add /path/to/pcb.json src/components/my-component`
4. Check the pins that were identified, pins are named after their net when it has a meaningful name (`VCC`, `SDA`) and after the part and pad number otherwise (`J1.2`). Pads of connectors are selected by default, the pads of other parts are listed so you can map them manually. Type Y to proceed or N to enter your own mappings
5. Now that you have added the component you will need to export it in `src/components/index.ts`, add the following line: `export { default as MyComponent } from "./my-component";`

The art is generated based on the footprints on the board:
- The outline, holes, pads and silkscreen are taken directly from the PCB, copper tracks are left out
- Bodies are chosen based on the reference (`R1`, `U2`) and package name of a footprint, you can edit `schema.svg` afterwards if a part doesn't look right
- Single row pin headers near the edge of the board get pins sticking out of the board, wires connect to the tips of these pins. Vertical headers (`-V-` in their package name) and headers with something between them and the edge are seen from above
- Bent headers with multiple rows (`-H-` or `ANGLED` in their package name) have staggered pins, wires connect to the tips of these pins
- Large pads without a net are seen as mounting holes, these are cut out of the board and aren't selected as pins
- If most parts are on the bottom of the board you will see the board from the bottom side

## Using component
Circuit components are added inside the C++ generator, first find all generators related to the component you're trying to add

1. You can add the component to the schema by using `const component = arduino.builder.add(`component-${pin}`, MyComponent);` (please ensure that the first argument is always unique to the connections of the component)
2. Connect the pins using `arduino.builder.connectCable([component1.port(pin), component.port("Out")], ...)`, with one entry for every pin (example: `arduino.builder.connectCable([arduino.builder.murphy.port(pin), component.port("Out")], [arduino.builder.murphy.port(`${pin}.3V3`), component.port("VCC")], [arduino.builder.murphy.port(`${pin}.GND`), component.port("GND")]);`)
3. List the pins in the order they are in on the connector of the component, this is what the colors of the wires are based on

### Using component: wire colors
All pins of a component are on one connector of a Leaphy cable, which can't be split. The colors of a wire therefore depend on the position of its pin, `connectCable` chooses them for you and only flips the cable around if needed:

| Pins | Wires | Used as |
| --- | --- | --- |
| 2 | red, black | Black is on GND |
| 3 | red, black, yellow | Red is on GND and yellow on the signal, our connectors have VCC in the middle so black ends up on VCC |
| 4 | orange, white, red, black | Black is on GND, the other wires go on whatever pin is next to it |

The wires of a cable are drawn next to each other in this order. If the pins on both ends are the other way around the wires cross near one of the ends, because a real cable has to be twisted there too.

### Using component: using an I2C peripheral
For adding an I2C peripheral you can use a simple utility, this utility will automatically find the correct channel by stepping through the workspace tree, use it by adding: 
`arduino.addI2CDeviceToSchema("my-component", block, MyComponent);`
