import { blocks } from "./blocks";
import registerExtensions from "./extensions";
import arduino from "./generators/arduino";
import python from "./generators/python";
import translations from "./msg/translations";

export * as CATEGORIES from "./categories/all";
export type { Debugger } from "./generators/arduino";
export { PinSelectorField, PinMapping } from "./fields/pinSelector";
export { Dependencies } from "./generators/arduino/dependencies";
export { arduino, blocks, python, registerExtensions, translations };
