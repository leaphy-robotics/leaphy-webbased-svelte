import { serialization } from "blockly";
import type * as monaco from "monaco-editor";
import type { Component } from "svelte";
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

/** Owns UI-only state: current mode, side panel, code buffer, and code editor instance. */
class WorkspaceUIState {
	code = $state("");
	codeEditor = $state<monaco.editor.IStandaloneCodeEditor>();
	saveState = $state(true);

	SidePanel = $state<Component | undefined>();
	Mode = $state<Component>(Mode.BLOCKS);

	constructor() {
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
}

/** Owns persistence: IndexedDB tempSaves, named saves, and block loading. */
class WorkspacePersistenceState {
	handleSave = $state<number>();

	constructor(
		private ui: WorkspaceUIState,
		private robotRef: () => RobotDevice,
	) {}

	async updateFileHandle() {
		await projectDB.saves.update(this.handleSave, {
			mode: this.ui.mode,
			robot: this.robotRef().id,
			date: Date.now(),
		});
	}

	async tempSave() {
		let mode = this.ui.mode;
		let content = this.ui.code;

		if (mode === "BLOCKS") {
			content = JSON.stringify(
				serialization.workspaces.save(BlocklyState.workspace),
			);
		}

		const existingSave = await projectDB.tempSaves
			.where("mode")
			.equals(mode)
			.and((save) =>
				mode === "BLOCKS" ? save.robot === this.robotRef().id : true,
			)
			.first();

		if (existingSave) {
			projectDB.tempSaves.update(existingSave.id, {
				content,
				fileSave: this.handleSave,
				date: Date.now(),
				robot: this.robotRef().id,
			});
		} else {
			projectDB.tempSaves.add({
				mode,
				content,
				fileSave: this.handleSave,
				date: Date.now(),
				robot: this.robotRef().id,
			});
		}
	}

	async loadBlocks(robotId: string) {
		const fetchedSave = await projectDB.tempSaves
			.where("mode")
			.equals("BLOCKS")
			.and((save) => save.robot === robotId)
			.first();

		return fetchedSave.content || null;
	}
}

/** Owns file system access: FileSystemFileHandle, open, and serialize. */
class WorkspaceFileState {
	handle = $state<Handle | undefined>();

	constructor(
		private ui: WorkspaceUIState,
		private persistence: WorkspacePersistenceState,
		private robotRef: () => RobotDevice,
		private openFn: (name: string, content: string) => void,
	) {}

	async openFileHandle(file: FileSystemFileHandle) {
		this.handle = new FileHandle(file);
		const content = await file.getFile();

		const existingSaves = await projectDB.saves.toArray();
		const existingSave = await findAsync(existingSaves, (save) =>
			save.fileHandle.isSameEntry(file),
		);

		try {
			if (!existingSave) {
				this.persistence.handleSave = await projectDB.saves.add({
					mode: this.ui.mode,
					robot: this.robotRef().id,
					date: Date.now(),
					fileHandle: file,
				});
			} else {
				this.persistence.handleSave = existingSave.id;
				await this.persistence.updateFileHandle();
			}
		} catch {
			// this will fail in tests because of the fake filesystemfilehandle
		}

		this.openFn(file.name, await content.text());
	}

	serialize() {
		if (this.ui.Mode === Mode.BLOCKS || this.ui.Mode === Mode.ML) {
			return JSON.stringify(
				serialization.workspaces.save(BlocklyState.workspace),
			);
		}

		return this.ui.code;
	}
}

class WorkspaceState {
	uploadLog = $state<string[]>([]);

	robot = $state<RobotDevice>();
	microPythonIO = $state<MicroPythonIO>();
	microPythonRun = $state<IOEventTarget>();

	private _ui = new WorkspaceUIState();
	private _persistence = new WorkspacePersistenceState(
		this._ui,
		() => this.robot,
	);
	private _file = new WorkspaceFileState(
		this._ui,
		this._persistence,
		() => this.robot,
		this.open.bind(this),
	);

	constructor() {
		window.addEventListener("beforeunload", this.tempSave.bind(this));
	}

	// --- UI slice delegates ---
	get code() {
		return this._ui.code;
	}
	set code(v) {
		this._ui.code = v;
	}

	get codeEditor() {
		return this._ui.codeEditor;
	}
	set codeEditor(v) {
		this._ui.codeEditor = v;
	}

	get saveState() {
		return this._ui.saveState;
	}
	set saveState(v) {
		this._ui.saveState = v;
	}

	get SidePanel() {
		return this._ui.SidePanel;
	}
	set SidePanel(v) {
		this._ui.SidePanel = v;
	}

	get Mode() {
		return this._ui.Mode;
	}
	set Mode(v) {
		this._ui.Mode = v;
	}

	get mode() {
		return this._ui.mode;
	}

	toggleSidePanel(panel: Component) {
		this._ui.toggleSidePanel(panel);
	}

	// --- Persistence slice delegates ---
	get handleSave() {
		return this._persistence.handleSave;
	}
	set handleSave(v) {
		this._persistence.handleSave = v;
	}

	async updateFileHandle() {
		return this._persistence.updateFileHandle();
	}

	async tempSave() {
		return this._persistence.tempSave();
	}

	async loadBlocks() {
		return this._persistence.loadBlocks(this.robot.id);
	}

	// --- File slice delegates ---
	get handle() {
		return this._file.handle;
	}
	set handle(v) {
		this._file.handle = v;
	}

	async openFileHandle(file: FileSystemFileHandle) {
		return this._file.openFileHandle(file);
	}

	serialize() {
		return this._file.serialize();
	}

	// --- open() lives on the facade as it touches both UI and robot state ---
	open(name: string, content: string) {
		if (name.endsWith(".ino")) {
			this._ui.Mode = Mode.ADVANCED;
			this._ui.code = content;
		} else if (name.endsWith(".py")) {
			this._ui.Mode = Mode.PYTHON;
			this.robot = robots.l_nano_esp32;
			this._ui.code = content;
		} else {
			if (this._ui.Mode === Mode.BLOCKS && BlocklyState.workspace) {
				if (!loadWorkspaceFromString(content, BlocklyState.workspace)) {
					return;
				}
			} else {
				BlocklyState.restore = JSON.parse(content);
				this._ui.Mode = Mode.BLOCKS;
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
