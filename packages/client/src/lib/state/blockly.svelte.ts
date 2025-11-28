import type { WorkspaceSvg } from "blockly";

class BlocklyState {
	workspace = $state<WorkspaceSvg>();

	restore = $state<Record<string, any>>();
	willRestore = $state<boolean>(true);

	audio = $state<boolean>(JSON.parse(localStorage.getItem("audio")) || true);

	canUndo = $state<boolean>(false);
	canRedo = $state<boolean>(false);

	constructor() {
		$effect.root(() => {
			$effect(() => {
				localStorage.setItem("audio", JSON.stringify(this.audio));
			});
		});
	}

	getSvg() {
		const workspace = this.workspace;
		const canvas = workspace.svgBlockCanvas_.cloneNode(true) as SVGElement;
		if (canvas.children[0] === undefined) throw "Couldn't find Blockly canvas."

		canvas.removeAttribute("transform");

		const css = `<defs>${(workspace.getRenderer().getConstants() as unknown as { cssNode: HTMLElement }).cssNode.outerHTML} <style>.blocklyIconGroup { opacity: 0; }</style></defs>`;
		const bbox = (document.getElementsByClassName("blocklyBlockCanvas")[0] as SVGGraphicsElement).getBBox();
		const content = new XMLSerializer().serializeToString(canvas);

		return `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${bbox.width}" height="${bbox.height}" viewBox="${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}">${css}<g class="zelos-renderer leaphy-light-theme">${content}</g></svg>`;    
	}
}

export default new BlocklyState();
