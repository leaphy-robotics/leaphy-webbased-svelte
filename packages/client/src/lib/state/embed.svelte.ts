import EmbedSidePanel from "$components/core/sidepanel/EmbedSidePanel.svelte";
import { pseudo } from "$domain/blockly/pseudo";
import { arduino } from "@leaphy-robotics/leaphy-blocks";
import { layoutComponents } from "@leaphy-robotics/schemas";
import { locale } from "svelte-i18n";
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

function encodeSvg(svgString: string) {
	return `data:image/svg+xml;utf8,${svgString
		.replace(
			"<svg",
			~svgString.indexOf("xmlns")
				? "<svg"
				: '<svg xmlns="http://www.w3.org/2000/svg"',
		)
		.replace(/"/g, "'")
		.replace(/%/g, "%25")
		.replace(/#/g, "%23")
		.replace(/{/g, "%7B")
		.replace(/}/g, "%7D")
		.replace(/</g, "%3C")
		.replace(/>/g, "%3E")
		.replace(/\s+/g, " ")
		.replace(/&/g, "%26")
		.replace("|", "%7C")
		.replace("[", "%5B")
		.replace("]", "%5D")
		.replace("^", "%5E")
		.replace("`", "%60")
		.replace(";", "%3B")
		.replace("?", "%3F")
		.replace(":", "%3A")
		.replace("@", "%40")
		.replace("=", "%3D")}`;
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
