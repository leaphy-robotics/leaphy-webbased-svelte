import type {WorkspaceSvg} from "blockly";
import { writable } from "svelte/store";

class BlocklyState {
	workspace = $state<WorkspaceSvg>()

	restore = $state<Record<string, any>>()
	willRestore = $state<boolean>(true)

	audio = $state<boolean>(JSON.parse(localStorage.getItem("audio")) || true)

	canUndo = $state<boolean>(false)
	canRedo = $state<boolean>(false)

	constructor() {
		$effect.root(() => {
			$effect(() => {
				localStorage.setItem("audio", JSON.stringify(this.audio));
			})
		})
	}
}

export default new BlocklyState();
