import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Advanced from "$components/workspace/advanced/Advanced.svelte";
import Blocks from "$components/workspace/blocks/Blocks.svelte";
import Python from "$components/workspace/python/Python.svelte";
import { loadWorkspaceFromString } from "$domain/blockly/blockly";
import { FileHandle, type Handle } from "$domain/handles";
import { type RobotDevice, robots } from "$domain/robots";
import { projectDB } from "$domain/storage";
import { findAsync, track } from "$state/utils";
import { serialization } from "blockly";
import type { Component } from "svelte";
import type MicroPythonIO from "../micropython";
import type { IOEventTarget } from "../micropython";
import BlocklyState from "./blockly.svelte";
import PopupState from "./popup.svelte";

export const Mode = {
	BLOCKS: Blocks as Component,
	ADVANCED: Advanced as Component,
	PYTHON: Python as Component,
};

export function getModeID(mode: Component) {
	switch (mode) {
		case Mode.BLOCKS: {
			return "BLOCKS";
		}
		case Mode.ADVANCED: {
			return "ADVANCED";
		}
		case Mode.PYTHON: {
			return "PYTHON";
		}
	}
}

class WorkspaceState {
	uploadLog = $state<string[]>([]);

	handle = $state<Handle | undefined>();
	handleSave = $state<number>();

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

	get mode() {
		return getModeID(this.Mode);
	}

	toggleSidePanel(panel: Component) {
		this.SidePanel = this.SidePanel === panel ? undefined : panel;
	}

	async updateFileHandle() {
		await projectDB.saves.update(this.handleSave, {
			mode: this.mode,
			robot: this.robot.id,
			date: Date.now(),
		});
	}

	async openFileHandle(file: FileSystemFileHandle) {
		this.handle = new FileHandle(file);
		const content = await file.getFile();

		const existingSaves = await projectDB.saves.toArray();
		const existingSave = await findAsync(existingSaves, (save) =>
			save.fileHandle.isSameEntry(file),
		);

		if (!existingSave) {
			this.handleSave = await projectDB.saves.add({
				mode: this.mode,
				robot: this.robot.id,
				date: Date.now(),
				fileHandle: file,
			});
		} else {
			this.handleSave = existingSave.id;
			await this.updateFileHandle();
		}

		this.open(file.name, await content.text());
	}

	async tempSave() {
		let mode = this.mode;
		let content = this.code;

		if (mode === "BLOCKS") {
			content = JSON.stringify(
				serialization.workspaces.save(BlocklyState.workspace),
			);
		}

		const existingSave = await projectDB.tempSaves
			.where("mode")
			.equals(mode)
			.and((save) => (mode === "BLOCKS" ? save.robot === this.robot.id : true))
			.first();

		if (existingSave) {
			projectDB.tempSaves.update(existingSave.id, {
				content,
				fileSave: this.handleSave,
				date: Date.now(),
				robot: this.robot.id,
			});
		} else {
			projectDB.tempSaves.add({
				mode,
				content,
				fileSave: this.handleSave,
				date: Date.now(),
				robot: this.robot.id,
			});
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
				if (!loadWorkspaceFromString(content, BlocklyState.workspace)) {
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
