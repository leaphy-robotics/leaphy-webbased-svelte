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

## Using component
Circuit components are added inside the C++ generator, first find all generators related to the component you're trying to add

1. You can add the component to the schema by using `const component = arduino.builder.add(`component-${pin}`, MyComponent);` (please ensure that the first argument is always unique to the connections of the component)
2. You can add pin connections by using `arduino.builder.connect(component1.port(pin), component.port("Out"), WireColor.DATA_1);` (example: `arduino.builder.connect(arduino.murphy.port(pin), component.port("Out"), WireColor.DATA_1);`)
3. Repeat adding pin connections for all pins on your component, adjust the wire color accordingly

### Using component: using an I2C peripheral
For adding an I2C peripheral you can use a simple utility, this utility will automatically find the correct channel by stepping through the workspace tree, use it by adding: 
`arduino.addI2CDeviceToSchema("my-component", block, MyComponent);`
