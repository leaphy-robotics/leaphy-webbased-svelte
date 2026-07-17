import * as Blockly from "blockly/core"
import * as blocklyBlocks from "blockly/blocks"
import {blocks, testConfig} from "../src/blocks"
import arduino from "../src/generators/arduino"
import registerExtensions from "../src/extensions"
import {PinSelectorField, PinMapping} from "../src/fields/pinSelector";
import translations from "../src/msg/translations";
import {describe, it} from "vitest";
import {TestConfig} from "../src/utils";
import "@blockly/field-bitmap";
import SerialState from "../../client/src/lib/state/serial.svelte";

Blockly.setLocale(translations['en'])

PinSelectorField.processPinMappings(PinMapping.UNIFIED);
Blockly.fieldRegistry.register("field_pin_selector", PinSelectorField);

registerExtensions(Blockly);
Blockly.common.defineBlocksWithJsonArray(Object.values(blocklyBlocks))
Blockly.common.defineBlocksWithJsonArray(blocks)

interface TestBlock {
	type: string;
	test: TestConfig;
}

console.log(testConfig)

describe("compile tests", () => {
	const testBlocks = blocks.filter(b => 'test' in b) as TestBlock[]
	const groups: Record<string, TestBlock[]> = {}
	testBlocks.forEach(block => {
		const group = block.test.group || "general"
		if (!(group in groups)) {
			groups[group] = [];
		}

		groups[group].push(block);
	})

	Object.entries(groups).forEach(([group, blocks]) => {
		const architectures = testConfig[group] || ['l_nano', 'l_nano_esp32']

		architectures.forEach(architecture => {
			it(`${group} blocks should compile on ${architecture}`, async () => {
				const workspace = new Blockly.Workspace()
				const startBlock = workspace.newBlock("leaphy_start")
				const content = startBlock.getInput("STACK") as Blockly.Input

				blocks.forEach((blockDef) => {
					const block = workspace.newBlock(blockDef.type);
					block.initModel()
					if (blockDef.test.type === "statement") {
						content.connection!.connect(block.previousConnection!)
						return
					}

					const print = workspace.newBlock("leaphy_serial_print_line")
					print.getInput("VALUE")!.connection!.connect(block.outputConnection!)
					content.connection!.connect(print.previousConnection!)
				})

				arduino.boardType = architecture

				const code = arduino.workspaceToCode(workspace)
				const dependencies = arduino.getDependencies()
				const res = await fetch(`https://testleaphyeasybloqs.com/api/compile/cpp`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						source_code: code,
						board: architecture === "l_nano" ? "arduino:avr:nano" : "arduino:esp32:nano_nora",
						libraries: dependencies
					}),
				});
				if (!res.ok) {
					console.log(code, (await res.json()).detail, dependencies);
				}
			})
		})
	})
})
