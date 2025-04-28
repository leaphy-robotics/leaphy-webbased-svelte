import { Variables, type WorkspaceSvg } from "blockly/core";
import type { ISerializer } from "blockly/core/interfaces/i_serializer";
import type { FlyoutDefinition } from "blockly/core/utils/toolbox";

export class List {
	public type = "Number";

	constructor(
		public id: string,
		public name: string,
	) {}
}

class ListManager {
	public lists: Record<string, List> = {};

	addList(name: string, id: string = crypto.randomUUID()) {
		this.lists[id] = new List(id, name);
	}

	getList(id: string): List | undefined {
		return this.lists[id];
	}

	getLists() {
		return Object.values(this.lists);
	}

	clear() {
		this.lists = {};
	}
}

export const listManager = new ListManager();

interface SerialList {
	name: string;
	id: string;
}
export class ListSerializer implements ISerializer {
	public priority = 90;

	clear() {
		listManager.clear();
	}

	load(state: SerialList[]) {
		for (const listState of state) {
			listManager.addList(listState.name, listState.id);
		}
	}

	save(): SerialList[] | null {
		const listStates = [];
		for (const list of listManager.getLists()) {
			listStates.push({
				id: list.id,
				name: list.name,
			});
		}

		return listStates.length > 0 ? listStates : null;
	}
}

const INDEX_PREFILL = {
	INDEX: {
		shadow: {
			type: "math_number",
			fields: {
				NUM: 0,
			},
		},
	},
};

export default function (workspace: WorkspaceSvg) {
	let blockList: FlyoutDefinition = [
		{
			kind: "button",
			text: "%{BKY_LISTS_CREATE}",
			callbackkey: "create_list",
		},
	];

	const lists = listManager.getLists();
	if (lists.length > 0) {
		const dynamicBlocks = [
			{ kind: "block", type: "lists_add" },
			{ kind: "block", type: "lists_delete", inputs: INDEX_PREFILL },
			{ kind: "sep", gap: 8 },
			{ kind: "block", type: "lists_insert", inputs: INDEX_PREFILL },
			{ kind: "sep", gap: 8 },
			{ kind: "block", type: "lists_replace", inputs: INDEX_PREFILL },
			{ kind: "block", type: "lists_get", inputs: INDEX_PREFILL },
			{ kind: "sep", gap: 8 },
			{ kind: "block", type: "lists_length" },
		];

		blockList = blockList.concat(dynamicBlocks);
	}

	workspace.registerButtonCallback("create_list", () => {
		Variables.promptName("create_list", "", (name) => {
			if (!name) return;

			listManager.addList(name);
			workspace.refreshToolboxSelection();
		});
	});

	return blockList;
}
