import { blocks } from "./blocks/blocks";
import registerExtensions from "./blocks/extensions";
import arduino from "./generators/arduino";
import translations from "./msg/translations";

export * as CATEGORIES from "./categories/all";
export { ProcedureSerializer } from "./generators/arduino/procedures";
export { translations, arduino, blocks, registerExtensions };
export { Dependencies } from "./generators/arduino/dependencies";
