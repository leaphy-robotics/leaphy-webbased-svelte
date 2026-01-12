import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Advanced from "$components/workspace/advanced/Advanced.svelte";
import Blocks from "$components/workspace/blocks/Blocks.svelte";
import ML from "$components/workspace/ml/ML.svelte";
import Python from "$components/workspace/python/Python.svelte";
import { loadWorkspaceFromString } from "$domain/blockly/blockly";
import { FileHandle, type Handle } from "$domain/handles";
import { type RobotDevice, robots } from "$domain/robots";
import { RobotType } from "$domain/robots.types";
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
	ML: ML as Component,
};

export function getModeID(mode: Component) {
	switch (mode) {
		case Mode.ML:
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

const extensionMap = {
	l_flitz_uno: RobotType.L_FLITZ_UNO,
	l_flitz_nano: RobotType.L_FLITZ_NANO,
	l_starling: RobotType.L_STARLING,
	l_starling_nano: RobotType.L_STARLING,
	l_starling_nano_esp32: RobotType.L_STARLING,
	l_original: RobotType.L_ORIGINAL,
	l_original_uno: RobotType.L_ORIGINAL,
	l_original_nano: RobotType.L_ORIGINAL,
	l_original_nano_esp32: RobotType.L_ORIGINAL,
	l_nano: RobotType.L_NANO,
	l_nano_esp32: RobotType.L_NANO,
	l_uno: RobotType.L_UNO,
	l_mega: RobotType.L_MEGA,
	l_micropython: RobotType.L_MICROPYTHON,
};

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

		try {
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
		} catch {
			// this will fail in tests because of the fake filesystemfilehandle
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

	async loadBlocks() {
		const robot = this.robot;

		const fetchedSave = await projectDB.tempSaves
			.where("mode")
			.equals("BLOCKS")
			.and((save) => save.robot === robot.id)
			.first();

		return fetchedSave.content || null;
	}

	open(name: string, content: string) {
		if (name.endsWith(".ino")) {
			this.Mode = Mode.ADVANCED;
			this.code = content;
		} else if (name.endsWith(".py")) {
			this.Mode = Mode.PYTHON;
			this.robot = robots.l_nano_esp32;
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

			const extension = name.split(".").at(-1);
			const robot = extensionMap[extension];
			if (!robot) {
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

			this.robot = Object.values(robots).find((r) => r.type === robot);
		}
	}
}

export default new WorkspaceState();
