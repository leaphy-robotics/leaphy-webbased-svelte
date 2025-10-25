import { dialog } from "blockly";
import type * as Blockly from "blockly/core";
import {
	type Block,
	type BlockSvg,
	type FieldDropdown,
	type Menu,
	type MenuItem,
	Msg,
	type WorkspaceSvg,
} from "blockly/core";
import { meshSignals } from "../categories/all";
import { listManager } from "../categories/lists";
import { ml } from "../categories/ml";
import type { DateItem } from "../generators/arduino/rtc";
import { after } from "../utils";

interface DynamicListItem {
	id: string;
	name: string;
}

export interface DynamicListManager {
	getItems(): DynamicListItem[];
	getItem(id: string): DynamicListItem | undefined;
	deleteItem(id: string): Promise<boolean> | boolean;
	renameItem(id: string, name: string): void;
}

export default function registerExtensions(blockly: typeof Blockly) {
	function createItemSelectExtension(
		type: string,
		manager: DynamicListManager,
	) {
		function extension(this: Block) {
			const input = this.getInput(type);
			if (!input) return;

			const field = new blockly.FieldDropdown(
				function (this: FieldDropdown) {
					const options = manager.getItems();
					const current = options.find(
						(option) => option.id === this.getValue(),
					);

					return [
						...manager.getItems().map((item) => [item.name, item.id]),
						[`${Msg[`RENAME_${type}`]} "${current?.name}"`, "RENAME_CURRENT"],
						[`${Msg[`DELETE_${type}`]} "${current?.name}"`, "DELETE_CURRENT"],
					] as [string, string][];
				},
				function (this: FieldDropdown, newValue) {
					if (newValue === "RENAME_CURRENT") {
						const item = this.getValue();
						if (!item) return;

						dialog.prompt(
							`${Msg[`RENAME_${type}`]} "${manager.getItem(item)?.name}"`,
							"",
							(name) => {
								if (!name) return;

								manager.renameItem(item, name);

								// Loops over every block and forces them to refresh the displayed name on the dynamic field
								blockly
									.getMainWorkspace()
									.getAllBlocks()
									.forEach((block) => {
										const field = block.getField(type) as FieldDropdown;
										if (!field || field.getValue() !== item) return;

										field.getOptions(false);
										field.setValue(item);
										field.forceRerender();
									});
								(
									blockly.getMainWorkspace() as WorkspaceSvg
								).refreshToolboxSelection();
							},
						);

						return item;
					}
					if (newValue === "DELETE_CURRENT") {
						const item = this.getValue();
						if (!item) return;

						// After deleting the item, dispose all blocks referencing the deleted item
						after(manager.deleteItem(item)).then((deleted) => {
							if (!deleted) return;

							blockly
								.getMainWorkspace()
								.getAllBlocks()
								.forEach((block) => {
									if (block.getFieldValue(type) === item) {
										block.dispose(true);
									}
								});
							(
								blockly.getMainWorkspace() as WorkspaceSvg
							).refreshToolboxSelection();
						});

						return item;
					}

					return newValue;
				},
			) as Blockly.Field;

			input.appendField(field, type);
		}

		return extension;
	}

	const LIST_SELECT_EXTENSION = createItemSelectExtension("LIST", listManager);
	blockly.Extensions.register("list_select_extension", LIST_SELECT_EXTENSION);

	const CLASS_SELECT_EXTENSION = createItemSelectExtension("CLASS", ml.classes);
	blockly.Extensions.register("class_select_extension", CLASS_SELECT_EXTENSION);

	const MESH_SIGNAL_SELECT_EXTENSION = createItemSelectExtension(
		"SIGNAL",
		meshSignals,
	);
	blockly.Extensions.register(
		"mesh_signal_select_extension",
		MESH_SIGNAL_SELECT_EXTENSION,
	);

	const APPEND_STATEMENT_INPUT_STACK = function (this: Block) {
		this.appendStatementInput("STACK");
	};

	function loadFormat(topBlock: BlockSvg, format: DateItem[]) {
		let connection = topBlock.getInput("STACK")?.connection;
		connection?.targetBlock()?.dispose?.(false);

		format.forEach((item) => {
			const block = topBlock.workspace.newBlock(
				item.type === "text" ? "fmt_text" : `fmt_${item.item}`,
			);
			if (item.type === "text") block.setFieldValue(item.value, "TEXT");
			else block.setFieldValue(item.fmt, "FMT");

			block.initSvg();
			block.render();
			connection?.connect(block.previousConnection);
			connection = block.nextConnection;
		});

		topBlock.render();
	}

	const DATE_FORMAT_MUTATOR = {
		structure: [] as DateItem[],

		loadExtraState(state: DateItem[]) {
			this.structure = state;
		},
		saveExtraState() {
			return this.structure;
		},

		updateStructure(block: BlockSvg, newStructure: DateItem[]) {
			const field = block.getField("FORMAT") as FormatField;
			if (
				JSON.stringify(newStructure) !==
				JSON.stringify(field.selectedStructure())
			) {
				field.setValue("custom");
			}

			this.structure = newStructure;
		},

		decompose(workspace: WorkspaceSvg) {
			const topBlock = workspace.newBlock("fmt_head");
			topBlock.initSvg();

			const field = topBlock.getField("FORMAT") as FormatField;
			field.onRefresh(() => this.compose(topBlock));

			loadFormat(topBlock, this.structure);
			return topBlock;
		},
		compose(topBlock: BlockSvg) {
			const result: DateItem[] = [];
			let block: BlockSvg | null = topBlock.getChildren(true)[0];
			if (!block) return this.updateStructure(topBlock, []);

			while (block) {
				if (block.type === "fmt_text")
					result.push({
						type: "text",
						value: block.getFieldValue("TEXT"),
					});
				else
					result.push({
						type: "item",
						item: block.type.split("fmt_")[1],
						fmt: block.getFieldValue("FMT"),
					});

				block = block.getNextBlock();
			}

			this.updateStructure(topBlock, result);
		},
	};

	type FormatOption = [string, DateItem[]];
	class FormatField extends blockly.FieldDropdown {
		private refreshListeners: (() => void)[] = [];

		constructor(private options: FormatOption[]) {
			const values = options.map(
				([option]) => [option, option] as [string, string],
			);
			super([...values, ["%{BKY_LEAPHY_TEMPLATE_CUSTOM}", "custom"]]);
		}

		protected onItemSelected_(menu: Menu, menuItem: MenuItem) {
			const option = this.options.find(
				(option) => option[0] === menuItem.getValue(),
			);
			if (option && this.sourceBlock_)
				loadFormat(this.sourceBlock_ as BlockSvg, option[1]);
			if (menuItem.getValue() === "custom" && this.sourceBlock_)
				loadFormat(this.sourceBlock_ as BlockSvg, []);
			this.sourceBlock_?.getRootBlock()?.compose?.(this.sourceBlock_);

			super.onItemSelected_(menu, menuItem);
			this.refreshListeners.forEach((listener) => listener());
		}

		selectedStructure() {
			const option = this.options.find(
				(option) => option[0] === this.getValue(),
			);
			if (option && this.sourceBlock_) return option[1];
			if (this.getValue() === "custom" && this.sourceBlock_) return [];
		}

		onRefresh(listener: () => void) {
			this.refreshListeners.push(listener);
		}
	}

	blockly.fieldRegistry.register("field_format", FormatField);
	blockly.Extensions.register(
		"appendStatementInputStack",
		APPEND_STATEMENT_INPUT_STACK,
	);
	blockly.Extensions.registerMutator(
		"l_format_date_mutator",
		DATE_FORMAT_MUTATOR,
		undefined,
		[
			"fmt_text",
			"fmt_second",
			"fmt_minute",
			"fmt_hour",
			"fmt_weekday",
			"fmt_day",
			"fmt_month",
			"fmt_year",
		],
	);
}
