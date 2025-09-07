import {DynamicListManager} from "../../blocks/extensions";
import {dialog} from "blockly";
import {Msg} from "blockly/core";
import type {ML} from "../ml";

export class Class {
	constructor(
		public id: string,
		public name: string,
		public key: string | null = null,
	) {}
}

export class ClassManager implements DynamicListManager {
	public classes: Record<string, Class> = {};

	constructor(private ml: ML) {}

	getItems() {
		return Object.values(this.classes);
	}

	createItem(
		name: string,
		id: string = crypto.randomUUID(),
		key: string | null = null,
	) {
		this.classes[id] = new Class(id, name, key);
		this.ml.dispatchEvent(new Event("updateClasses"));
	}

	async deleteItem(id: string) {
		if (this.ml.datasets.getItems().length) {
			const confirmed = await new Promise<boolean>((resolve) =>
				dialog.confirm(Msg.CONFIRM_CLEAR, (result) => resolve(result)),
			);
			if (!confirmed) return false;
		}

		this.ml.datasets.clear();

		delete this.classes[id];
		this.ml.dispatchEvent(new Event("updateClasses"));

		return true;
	}

	renameItem(id: string, name: string) {
		this.classes[id].name = name;
		this.ml.dispatchEvent(new Event("updateClasses"));
	}

	getItem(id: string) {
		return this.classes[id];
	}

	getItemIndex(id: string) {
		return this.getItems().indexOf(this.getItem(id));
	}

	clear() {
		this.classes = {};
		this.ml.dispatchEvent(new Event("updateClasses"));
	}
}
