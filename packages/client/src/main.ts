import "@xterm/xterm/css/xterm.css";
import "overlayscrollbars/overlayscrollbars.css";
import "./app.css";
import { mount } from "svelte";
import { addMessages, init } from "svelte-i18n";
import "$domain/robots";
import App from "./App.svelte";
import enTranslations from "./assets/translations/en.json";
import nlTranslations from "./assets/translations/nl.json";
import initMatomo from "./lib/matomo";
import initSentry from "./lib/sentry";
import AppState, { Screen } from "./lib/state/app.svelte";
import WorkspaceState, { Mode } from "./lib/state/workspace.svelte";
import { robots } from "./lib/domain/robots";
import BlocklyState from "./lib/state/blockly.svelte";
import { pseudo, serializeBlock } from "./lib/domain/blockly/pseudo";

import { Buffer } from "buffer";
import { loadWorkspaceFromString } from "$domain/blockly/blockly";
import { arduino } from "@leaphy-robotics/leaphy-blocks";
import { layoutComponents } from "@leaphy-robotics/schemas";
window.Buffer = Buffer;

initSentry();

addMessages("en", enTranslations);
addMessages("nl", nlTranslations);

init({
	fallbackLocale: "en",
	initialLocale: localStorage.getItem("language"),
});

initMatomo();

// Parse embed query parameters
async function initializeEmbed() {
	const urlParams = new URLSearchParams(window.location.search);
	if (!urlParams.has("embed")) {
		return;
	}

	AppState.isEmbedded = true;
	AppState.Screen = Screen.WORKSPACE;
	WorkspaceState.Mode = Mode.BLOCKS;
	WorkspaceState.robot = robots.l_original;

	window.addEventListener("message", async (event) => {
		console.log(event.data);
		if (event.data.type === "export") {
			const data = event.data.export as { 
				content: boolean, 
				pseudo: boolean, 
				svg: boolean,
				connections: boolean,
				schema: boolean,
			};
			const result: Record<string, string> = {}

			if (data.content) result.content = WorkspaceState.serialize();
			if (data.pseudo) result.pseudo = pseudo(BlocklyState.workspace);
			if (data.svg) result.svg = BlocklyState.getSvg();
			if (data.connections) result.connections = arduino.builder.getConnectionsString();
			if (data.schema) {
				const canvas = document.createElement("canvas");
				await layoutComponents(canvas, arduino.builder);
				result.schema = canvas.toDataURL("image/png");
			}

			window.parent.postMessage({ type: "export", data: result }, "*");
		}
		if (event.data.type === "load") {
			const data = event.data.load as { mode: string, robot: string, content: string };

			const modeMap: Record<string, typeof Mode.BLOCKS> = {
				blocks: Mode.BLOCKS,
				advanced: Mode.ADVANCED,
				python: Mode.PYTHON,
			};
			
			WorkspaceState.Mode = modeMap[data.mode.toLowerCase()];
			WorkspaceState.robot = robots[data.robot];

			if (data.content) {
				if (WorkspaceState.Mode === Mode.BLOCKS) {
					if (BlocklyState.workspace) {
						loadWorkspaceFromString(data.content, BlocklyState.workspace);
					} else {
						BlocklyState.restore = JSON.parse(data.content);
						BlocklyState.willRestore = true;
					}
				} else {
					WorkspaceState.code = data.content;
				}
			}
		}
	});

	window.parent.postMessage({ type: "ready" }, "*");
}

// Initialize embed mode before mounting
await initializeEmbed();

const app = mount(App, {
	target: document.getElementById("app"),
});

export default app;
