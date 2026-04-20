import { arduino } from "@leaphy-robotics/leaphy-blocks";
import { layoutComponents } from "@leaphy-robotics/schemas";
import { locale } from "svelte-i18n";
import EmbedSidePanel from "$components/core/sidepanel/EmbedSidePanel.svelte";
import { pseudo } from "$domain/blockly/pseudo";
import AppState, { Screen } from "./app.svelte";
import BlocklyState from "./blockly.svelte";
import { track } from "./utils";
import WorkspaceState, { Mode } from "./workspace.svelte";

interface Exports {
	workspace: boolean;
	workspaceSvg: boolean;
	circuit: boolean;
	pseudo: boolean;
}

function encodeSvg(svgString: string): string {
	const svgWithNamespace = svgString.includes("xmlns")
		? svgString
		: svgString.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
	const cleanedSvg = svgWithNamespace.trim().replace(/\s+/g, " ");

	return `data:image/svg+xml,${encodeURIComponent(cleanedSvg)}`;
}

class EmbedState {
	isEmbedded = $state(false);
	action = $state(null);
	sidebar = $state(null);

	exports: Exports = null;
	previousUpdate: NodeJS.Timeout | null = null;

	async getCircuit() {
		const canvas = document.createElement("canvas");
		await layoutComponents(canvas, arduino.builder);
		return canvas.toDataURL();
	}

	queueUpdate(countdown = 1000) {
		if (!this.exports) return;
		if (this.previousUpdate !== null) {
			clearTimeout(this.previousUpdate);
		}

		this.previousUpdate = setTimeout(async () => {
			let data: Record<string, string> = {};

			if (this.exports.workspace) data.workspace = WorkspaceState.serialize();
			if (this.exports.pseudo) data.pseudo = pseudo(BlocklyState.workspace);
			if (this.exports.workspaceSvg)
				data.workspaceSvg = encodeSvg(BlocklyState.getSvg());
			if (this.exports.circuit) data.circuit = await this.getCircuit();

			parent.postMessage(
				{
					type: "change",
					content: data,
				},
				"*",
			);
		}, countdown);
	}

	constructor() {
		$effect.root(() => {
			$effect(() => {
				BlocklyState.workspace?.addChangeListener?.(() => {
					this.queueUpdate();
				});
			});
		});
	}

	setupEmbedApi() {
		const queryParams = new URLSearchParams(window.location.search);
		const embed = queryParams.get("embed");
		if (!embed) return;

		this.isEmbedded = true;

		window.addEventListener("message", (event) => {
			if (event.data.type === "open") {
				WorkspaceState.open(event.data.name, event.data.content);
				AppState.Screen = Screen.WORKSPACE;

				locale.set(event.data.locale || "en");
				this.action = event.data.action;
				this.exports = event.data.exports;
			}

			if (event.data.type === "sidebar") {
				this.sidebar = event.data.url;
				WorkspaceState.SidePanel = EmbedSidePanel;
			}
		});
	}

	callAction() {
		if (!("parent" in window)) return;

		this.queueUpdate(0);
		parent.postMessage(
			{
				type: "action",
			},
			"*",
		);
	}
}

export default new EmbedState();
