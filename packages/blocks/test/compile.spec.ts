import * as blocklyBlocks from "blockly/blocks";
import * as Blockly from "blockly/core";
import { describe, expect, it } from "vitest";
import { blocks, testConfig } from "../src/blocks";
import registerExtensions from "../src/extensions";
import { PinMapping, PinSelectorField } from "../src/fields/pinSelector";
import arduino from "../src/generators/arduino";
import translations from "../src/msg/translations";
import type { TestConfig } from "../src/utils";
import "@blockly/field-bitmap";
import SerialState from "../../client/src/lib/state/serial.svelte";

Blockly.setLocale(translations.en);

PinSelectorField.processPinMappings(PinMapping.UNIFIED);
Blockly.fieldRegistry.register("field_pin_selector", PinSelectorField);

registerExtensions(Blockly);
Blockly.common.defineBlocksWithJsonArray(Object.values(blocklyBlocks));
Blockly.common.defineBlocksWithJsonArray(blocks);

function getInputBlock(check: "String" | "Number" | "Boolean") {
	switch (check) {
		case "Number": {
			return {
				type: "math_number",
				fields: { NUM: 0 },
			};
		}
		case "String": {
			return {
				type: "text",
				fields: { TEXT: "" },
			};
		}
		case "Boolean": {
			return {
				type: "logic_boolean",
			};
		}
	}
}

interface TestBlock {
	type: string;
	test: TestConfig;
	args0: {
		type: string;
		name: string;
		check?: "String" | "Number" | "Boolean";
	}[];
}

describe("compile tests", () => {
	const testBlocks = blocks.filter((b) => "test" in b) as TestBlock[];
	const groups: Record<string, TestBlock[]> = {};
	testBlocks.forEach((block) => {
		const group = block.test.group || "general";
		if (!(group in groups)) {
			groups[group] = [];
		}

		groups[group].push(block);
	});

	Object.entries(groups).forEach(([group, blocks]) => {
		const architectures = testConfig[group] || ["l_nano", "l_nano_esp32"];

		architectures.forEach((architecture) => {
			it.concurrent(`${group} blocks should compile on ${architecture}`, async () => {
				const workspace = new Blockly.Workspace();
				const startBlock = workspace.newBlock("leaphy_start");
				const content = startBlock.getInput("STACK") as Blockly.Input;

				blocks.forEach((blockDef) => {
					const block = workspace.newBlock(blockDef.type);
					if (blockDef.args0) {
						blockDef.args0.forEach((arg) => {
							if (arg.type !== "input_value" || !arg.check) return;

							const blockType = getInputBlock(arg.check);
							const valueBlock = workspace.newBlock(blockType.type);
							if (blockType.fields) {
								Object.entries(blockType.fields).forEach(([key, value]) => {
									valueBlock.setFieldValue(value, key);
								});
							}

							if (!valueBlock.outputConnection) return;
							block
								.getInput(arg.name)
								?.connection?.connect(valueBlock.outputConnection);
						});
					}

					block.initModel();
					if (blockDef.test.type === "statement") {
						if (!block.previousConnection)
							throw new Error(
								`${blockDef.type} doesn't have a previous connection!`,
							);
						content.connection?.connect(block.previousConnection);
						return;
					}

					const print = workspace.newBlock("leaphy_serial_print_line");
					if (!block.outputConnection)
						throw new Error(
							`${blockDef.type} does not have an output connection!`,
						);
					print.getInput("VALUE")?.connection?.connect(block.outputConnection);

					if (!print.previousConnection)
						throw new Error(`Print block doesn't have a previous connection!`);
					content.connection?.connect(print.previousConnection);
				});

				arduino.boardType = architecture;

				const code = arduino.workspaceToCode(workspace);
				const dependencies = arduino.getDependencies();
				const res = await fetch(
					`https://testleaphyeasybloqs.com/api/compile/cpp`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							source_code: code,
							board:
								architecture === "l_nano"
									? "arduino:avr:nano"
									: "arduino:esp32:nano_nora",
							libraries: dependencies,
						}),
					},
				);

				expect(
					res.ok,
					`${code}\nlibraries: ${dependencies}\n ${(await res.json()).detail}`,
				).toBe(true);
			});
		});
	});
});
