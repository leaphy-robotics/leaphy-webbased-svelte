import { Workspace } from "blockly";
import {DynamicListManager} from "../blocks/extensions";
import {ISerializer} from "blockly/core/interfaces/i_serializer";
import {Msg, Variables, WorkspaceSvg} from "blockly/core";
import type {FlyoutDefinition} from "blockly/core/utils/toolbox";
import {listManager} from "./lists";

interface Signal {
	id: string;
	name: string;
}

class MeshSignalManager implements DynamicListManager {
	public signals: Signal[] = [];

	getItems() {
		return this.signals;
	}

	getItem(id: string) {
		return this.signals.find(s => s.id === id);
	}

	deleteItem(id: string) {
		this.signals.splice(this.signals.findIndex(s => s.id === id), 1);

		return true;
	}

	createItem(name: string, id = crypto.randomUUID()) {
		this.signals.push({
			id, name
		});
	}

	renameItem(id: string, name: string): void {
		this.signals[this.signals.findIndex(s => s.id === id)].name = name;
	}
}

export const meshSignals = new MeshSignalManager();

export class MeshSignalSerializer implements ISerializer {
    public priority = 90;

    save() {
		return meshSignals.signals
    }

    load(state: Object): void {
        meshSignals.signals = state as Signal[];
    }

    clear(): void {
        meshSignals.signals = [];
    }
}

export default function (workspace: WorkspaceSvg) {
	const blockList: FlyoutDefinition = [
		{
			kind: "button",
			text: "%{BKY_LEAPHY_MESH_CREATE_SIGNAL}",
			callbackkey: "create_signal",
		},
	];

	const signals = meshSignals.getItems();
	if (signals.length > 0) {
		blockList.push(...[
			{
				kind: "block",
				type: "mesh_setup",
				inputs: {
					NAME: {
						shadow: {
							type: "text",
							fields: { TEXT: 'Leaphy Mesh' },
						},
					},
				}
			},
			{ kind: "sep", gap: 8 },
			{ kind: "block", type: "mesh_update" },

			{ kind: "block", type: "mesh_on_signal" },
			{ kind: "sep", gap: 8 },
			{ kind: "block", type: "mesh_sender" },

			{ kind: "block", type: "mesh_broadcast_signal" },
			{ kind: "sep", gap: 8 },
			{
				kind: "block",
				type: "mesh_call_signal",
				inputs: {
					RECIPIENT: {
						shadow: {
							type: "mesh_sender",
						}
					}
				}
			},
		]);
	}

	workspace.registerButtonCallback("create_signal", () => {
		Variables.promptName(Msg.LEAPHY_MESH_NEW_SIGNAL, "", (name) => {
			if (!name) return;

			meshSignals.createItem(name);
			workspace.refreshToolboxSelection();
		});
	});

	return blockList;
}
