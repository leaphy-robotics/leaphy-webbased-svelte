export interface Component {
	schema: string;
	mappings: Record<string, string>;
}

export { default as RGBFlitz } from "./rgb-flitz";
export { default as Murphy } from "./murphy";
export { default as LineSensor } from "./line-sensor";
export { default as MurphyI2C } from "./murphy-i2c";
export { default as Ultrasonic } from "./ultrasonic";
export { default as servo } from "./servo";
export { default as Gas } from "./gas";
export { default as ToF } from "./ToF";
export { default as LightSensor } from "./light-sensor";
