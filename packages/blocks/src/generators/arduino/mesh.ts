import type { Block } from "blockly";
import type { Arduino } from "../arduino";
import { procedureManager } from "./procedures";

function getCodeGenerators(arduino: Arduino) {
	arduino.forBlock.mesh_setup = (block: Block) => {
		arduino.addInclude("mesh", "#include <painlessMesh.h>");
		arduino.addDeclaration("mesh", "painlessMesh mesh;", true, 3);
		arduino.addDeclaration("node_sender", "uint32_t node_sender;", true, 3);
		arduino.addDeclaration(
			"mesh_consume",
			"String parseArg(String &msg) {\n" +
				"   int index = msg.indexOf('\\n');\n" +
				"   String result = msg.substring(0, index);\n" +
				"   msg = msg.substring(index + 1);\n\n" +
				"   return result;\n" +
				"}",
			true,
			2,
		);

		let receive_callback =
			"void receivedCallback(uint32_t from, String &msg) {\n" +
			"   node_sender = from;\n" +
			"   String channel = parseArg(msg);\n\n";

		block.workspace.getBlocksByType("mesh_add_procedure").forEach((block) => {
			const method = block.getFieldValue("METHOD");
			const procedure = procedureManager.getProcedure(method);
			if (!procedure) return;

			receive_callback += `   if (channel == "${method}") {\n`;

			procedure.arguments.forEach((arg) => {
				receive_callback += `      double ${arg.name} = parseArg(msg).toDouble();\n`;
			});

			receive_callback += `      ${method}(${procedure.arguments
				.map((e) => e.name)
				.join(", ")});\n   }\n`;
		});
		receive_callback += "}\n";

		arduino.addDeclaration("mesh_receiver", receive_callback, true, 1);

		const name = arduino.valueToCode(block, "NAME", arduino.ORDER_NONE);

		let code = `mesh.init(${name}, "Leaphy123");\nmesh.onReceive(&receivedCallback);\n`;

		if (block.workspace.getBlocksByType("mesh_on_connection").length > 0) {
			code += "mesh.onNewConnection(&onConnection);\n";
		}

		return code;
	};

	arduino.forBlock.mesh_update = () => "mesh.update();\n";

	arduino.forBlock.mesh_add_procedure = () => "";

	arduino.forBlock.mesh_call_procedure = (block: Block) => {
		const method = block.getFieldValue("METHOD");
		const to = arduino.valueToCode(block, "TO", arduino.ORDER_NONE);
		const procedure = procedureManager.getProcedure(method);
		if (!procedure) return "";

		const msg = [`"${method}\\n"`];
		procedure.arguments.forEach(({ id }) => {
			msg.push(`String(${arduino.valueToCode(block, id, arduino.ORDER_NONE)})`);
			msg.push('"\\n"');
		});

		return `mesh.sendSingle(${to}, ${msg.join(" + ")});\n`;
	};

	arduino.forBlock.mesh_call_procedure_all = (block: Block) => {
		const method = block.getFieldValue("METHOD");
		const procedure = procedureManager.getProcedure(method);
		if (!procedure) return "";

		const msg = [`"${method}\\n"`];
		procedure.arguments.forEach(({ id }) => {
			msg.push(`String(${arduino.valueToCode(block, id, arduino.ORDER_NONE)})`);
			msg.push('"\\n"');
		});

		return `mesh.sendBroadcast(${msg.join(" + ")});\n`;
	};

	arduino.forBlock.mesh_on_connection = (block: Block) => {
		const branch = arduino.statementToCode(block, "STACK");

		const code = `void onConnection(uint32_t node_sender) {\n${branch}}\n`;
		arduino.addDeclaration("mesh_connect", code, true, 1);

		return null;
	};

	arduino.forBlock.mesh_client = () => ["node_sender", arduino.ORDER_ATOMIC];
}

export default getCodeGenerators;
