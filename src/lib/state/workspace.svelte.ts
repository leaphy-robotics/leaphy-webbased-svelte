import Advanced from "$components/workspace/advanced/Advanced.svelte";
import Blocks from "$components/workspace/blocks/Blocks.svelte";
import Python from "$components/workspace/python/Python.svelte";
import type { Handle } from "$domain/handles";
import { type RobotDevice } from "$domain/robots";
import { serialization } from "blockly";
import type { Component } from "svelte";
import type MicroPythonIO from "../micropython";
import type { IOEventTarget } from "../micropython";
import BlocklyState from "./blockly.svelte";
import PopupState from "./popup.svelte";
import {track} from "$state/utils";

export const Mode = {
	BLOCKS: Blocks as Component,
	ADVANCED: Advanced as Component,
	PYTHON: Python as Component,
};

class WorkspaceState {
	uploadLog = $state<string[]>([])
	handle = $state<Handle|undefined>()
	robot = $state<RobotDevice>()
	microPythonIO = $state<MicroPythonIO>()
	microPythonRun = $state<IOEventTarget>()

	code = $state('')
	saveState = $state(true)

	SidePanel = $state<Component|undefined>()
	Mode = $state<Component>(Mode.BLOCKS)

	constructor() {
		window.addEventListener("beforeunload", this.tempSave.bind(this));
		$effect.root(() => {
			$effect(() => {
				track(this.Mode)

				PopupState.clear()
				this.SidePanel = undefined
			})

			$effect(() => {
				track(this.code)

				this.saveState = false
			})
		})
	}

	toggleSidePanel(panel: Component) {
		this.SidePanel = this.SidePanel === panel ? undefined : panel
	}

	tempSave() {
		let saveAddress = this.robot.id;
		switch (this.Mode) {
			case Mode.ADVANCED: {
				saveAddress = "l_cpp";
				break;
			}
			case Mode.PYTHON: {
				saveAddress = "l_micropython";
				break;
			}
		}

		const contentAddress = `${saveAddress}_content`;
		localStorage.setItem(`${saveAddress}_robot`, this.robot.id);

		switch (this.Mode) {
			case Mode.BLOCKS: {
				localStorage.setItem(
					contentAddress,
					JSON.stringify(serialization.workspaces.save(BlocklyState.workspace)),
				);
				break;
			}
			case Mode.ADVANCED: {
				localStorage.setItem(contentAddress, this.code);
				break;
			}
			case Mode.PYTHON: {
				localStorage.setItem(contentAddress, this.code);
				break;
			}
		}
	}
}

export default new WorkspaceState()
