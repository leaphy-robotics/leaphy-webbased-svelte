import * as Blockly from "blockly";

/**
 * Replace %{BKY_...} references in the string values of a toolbox item, so things like
 * the names of ready-made subprograms are shown in the current language.
 */
export function resolveMessages<T>(value: T): T {
	if (typeof value === "string") {
		return (
			value.includes("%{BKY_")
				? Blockly.utils.parsing.replaceMessageReferences(value)
				: value
		) as T;
	}
	if (Array.isArray(value)) return value.map(resolveMessages) as T;
	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, resolveMessages(item)]),
		) as T;
	}
	return value;
}
