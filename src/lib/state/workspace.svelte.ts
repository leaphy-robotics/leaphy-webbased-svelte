import Advanced from "$components/workspace/advanced/Advanced.svelte";
import Blocks from "$components/workspace/blocks/Blocks.svelte";
import Python from "$components/workspace/python/Python.svelte";
import {FileHandle, type Handle} from "$domain/handles";
import {type RobotDevice, robots} from "$domain/robots";
import { track } from "$state/utils";
import { serialization } from "blockly";
import type { Component } from "svelte";
import type MicroPythonIO from "../micropython";
import type { IOEventTarget } from "../micropython";
import BlocklyState from "./blockly.svelte";
import PopupState from "./popup.svelte";
import {loadWorkspaceFromString} from "$domain/blockly/blockly";
import ErrorPopup from "$components/core/popups/popups/Error.svelte";

export const Mode = {
	BLOCKS: Blocks as Component,
	ADVANCED: Advanced as Component,
	PYTHON: Python as Component,
};

class WorkspaceState {
	uploadLog = $state<string[]>([]);
	handle = $state<Handle | undefined>();
	robot = $state<RobotDevice>();
	microPythonIO = $state<MicroPythonIO>();
	microPythonRun = $state<IOEventTarget>();

	code = $state("");
	saveState = $state(true);

	SidePanel = $state<Component | undefined>();
	Mode = $state<Component>(Mode.BLOCKS);

	constructor() {
		window.addEventListener("beforeunload", this.tempSave.bind(this));
		$effect.root(() => {
			$effect(() => {
				track(this.Mode);

				PopupState.clear();
				this.SidePanel = undefined;
			});

			$effect(() => {
				track(this.code);

				this.saveState = false;
			});
		});
	}

	toggleSidePanel(panel: Component) {
		this.SidePanel = this.SidePanel === panel ? undefined : panel;
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

	open(name: string, content: string) {
		if (name.endsWith(".ino")) {
			this.Mode = Mode.ADVANCED;
			this.code = content;
		} else if (name.endsWith(".py")) {
			this.Mode = Mode.PYTHON;
			this.robot = robots.l_nano_rp2040;
			this.code = content;
		} else {
			if (this.Mode === Mode.BLOCKS && BlocklyState.workspace) {
				if (
					!loadWorkspaceFromString(content, BlocklyState.workspace)
				) {
					return;
				}
			} else {
				BlocklyState.restore = JSON.parse(content);
				this.Mode = Mode.BLOCKS;
			}
			if (!robots[name.split(".").at(-1)]) {
				PopupState.open({
					component: ErrorPopup,
					data: {
						title: "UNDEFINED_ROBOT",
						message: "UNDEFINED_ROBOT_MESSAGE",
					},
					allowInteraction: false,
				});
				return;
			}

			this.robot = robots[name.split(".").at(-1)];
		}
	}
}

export default new WorkspaceState();
