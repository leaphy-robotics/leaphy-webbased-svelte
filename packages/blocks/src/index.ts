import { blocks } from "./blocks/blocks";
import registerExtensions from "./blocks/extensions";
import arduino from "./generators/arduino";
import python from "./generators/python";
import translations from "./msg/translations";

export * as THEME from "./theme/theme";
export * as CATEGORIES from "./categories/all";
export { ProcedureSerializer } from "./generators/arduino/procedures";
export { translations, arduino, python, blocks, registerExtensions };
export { Dependencies } from "./generators/arduino/dependencies";
