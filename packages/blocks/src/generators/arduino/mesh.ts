import type { Block } from "blockly";
import { meshSignals } from "../../categories/all";
import type { Arduino } from "../arduino";
import { Dependencies } from "./dependencies";

function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.mesh_setup = (block: Block) => {
		arduino.addDependency(Dependencies.PAINLESS_MESH, Dependencies.ASYNC_TCP);
		arduino.addInclude("mesh", "#include <painlessMesh.h>");
		arduino.addDeclaration("mesh", "painlessMesh mesh;", true, 3);
		arduino.addDeclaration("node_sender", "uint32_t node_sender;", true, 3);

		const receive_callback = `void receivedCallback(uint32_t from, String &msg) {\n  node_sender = from;\n${block.workspace
			.getBlocksByType("mesh_on_signal")
			.map((block) => {
				const signal = meshSignals.getItem(block.getFieldValue("SIGNAL"));
				if (!signal) return "";

				return `  if (msg == "${signal.name}") {\n${arduino
					.statementToCode(block, "STACK")
					.split("\n")
					.map((e) => `  ${e}`)
					.join("\n")}}\n`;
			})
			.join("")}}\n`;

		arduino.addDeclaration("mesh_receiver", receive_callback, true, 1);

		const name = block.getFieldValue("NAME");
		arduino.addSetup(
			"MESH",
			`mesh.init("${name}", "Leaphy123");\n  mesh.onReceive(&receivedCallback);\n`,
		);
		return "";
	};

	arduino.forBlock.mesh_update = () => "mesh.update();\n";

	arduino.forBlock.mesh_on_signal = () => "";

	arduino.forBlock.mesh_call_signal = (block: Block) => {
		const signal = meshSignals.getItem(block.getFieldValue("SIGNAL"));
		if (!signal) return "";

		const recipient = arduino.valueToCode(
			block,
			"RECIPIENT",
			arduino.ORDER_NONE,
		);
		return `mesh.sendSingle(${recipient}, "${signal.name}");\n`;
	};

	arduino.forBlock.mesh_broadcast_signal = (block: Block) => {
		const signal = meshSignals.getItem(block.getFieldValue("SIGNAL"));
		if (!signal) return "";

		return `mesh.sendBroadcast("${signal.name}");\n`;
	};

	arduino.forBlock.mesh_sender = () => ["node_sender", arduino.ORDER_ATOMIC];
}

export default getCodeGenerators;
