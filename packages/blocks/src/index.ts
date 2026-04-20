import { blocks } from "./blocks/blocks";
import registerExtensions from "./blocks/extensions";
import arduino from "./generators/arduino";
import python from "./generators/python";
import translations from "./msg/translations";

export * as CATEGORIES from "./categories/all";
export type { Debugger } from "./generators/arduino";
export { Dependencies } from "./generators/arduino/dependencies";
export { arduino, blocks, python, registerExtensions, translations };
