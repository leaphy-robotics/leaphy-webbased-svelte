import * as Blockly from "blockly/core";
import type {
	Block,
	BlockSvg,
	Connection,
	Menu,
	MenuItem,
	Workspace,
	WorkspaceSvg,
} from "blockly/core";
import { type List, listManager } from "../categories/lists";
import { procedureManager } from "../generators/arduino/procedures";
import type { DateItem } from "../generators/arduino/rtc";

const xmlUtils = Blockly.utils.xml;

export default function registerExtensions(blockly: typeof Blockly) {
	const LIST_SELECT_EXTENSION = function (this: Block) {
		const input = this.getInput("LIST");
		if (!input) return;

		input.appendField(
			new blockly.FieldDropdown(() => {
				return listManager.getLists().map((list: List) => {
					return [list.name, list.id];
				});
			}) as Blockly.Field,
			"LIST",
		);
	};

	const APPEND_STATEMENT_INPUT_STACK = function (this: Block) {
		this.appendStatementInput("STACK");
	};

	type IfExtraState = {
		elseIfCount?: number;
		hasElse?: boolean;
	};

	interface ClauseBlock extends Block {
		valueConnection_?: Connection | null;
		statementConnection_?: Connection | null;
	}

	const CONTROLS_IF_MUTATOR_MIXIN = {
		elseifCount_: 0,
		elseCount_: 0,

		mutationToDom: function (this: IfBlock) {
			if (!this.elseifCount_ && !this.elseCount_) {
				return null;
			}
			const container = xmlUtils.createElement("mutation");
			if (this.elseifCount_) {
				container.setAttribute("elseif", String(this.elseifCount_));
			}
			if (this.elseCount_) {
				container.setAttribute("else", "1");
			}
			return container;
		},

		domToMutation: function (this: IfBlock, xmlElement: Element) {
			this.elseifCount_ =
				Number.parseInt(xmlElement.getAttribute("elseif") as string, 10) || 0;
			this.elseCount_ =
				Number.parseInt(xmlElement.getAttribute("else") as string, 10) || 0;
			this.rebuildShape_();
		},

		saveExtraState: function (this: IfBlock): IfExtraState | null {
			if (!this.elseifCount_ && !this.elseCount_) {
				return null;
			}
			const state = Object.create(null);
			if (this.elseifCount_) {
				state.elseIfCount = this.elseifCount_;
			}
			if (this.elseCount_) {
				state.hasElse = true;
			}
			return state;
		},

		loadExtraState: function (this: IfBlock, state: IfExtraState) {
			this.elseifCount_ = state.elseIfCount || 0;
			this.elseCount_ = state.hasElse ? 1 : 0;
			this.updateShape_();
		},

		decompose: function (this: IfBlock, workspace: Workspace): Block {
			const containerBlock = workspace.newBlock("controls_if_if");
			(containerBlock as BlockSvg).initSvg();
			let connection = containerBlock.nextConnection as Connection;
			for (let i = 1; i <= this.elseifCount_; i++) {
				const elseifBlock = workspace.newBlock("controls_if_elseif");
				(containerBlock as BlockSvg).initSvg();
				connection.connect(elseifBlock.previousConnection as Connection);
				connection = elseifBlock.nextConnection as Connection;
			}
			if (this.elseCount_) {
				const elseBlock = workspace.newBlock("controls_if_else");
				(elseBlock as BlockSvg).initSvg();
				connection.connect(elseBlock.previousConnection as Connection);
			}
			return containerBlock;
		},

		compose: function (this: IfBlock, containerBlock: Block) {
			let clauseBlock =
				containerBlock.nextConnection?.targetBlock() as ClauseBlock | null;
			// Count number of inputs.
			this.elseifCount_ = 0;
			this.elseCount_ = 0;
			const valueConnections: Array<Connection | null> = [null];
			const statementConnections: Array<Connection | null> = [null];
			let elseStatementConnection: Connection | null = null;
			while (clauseBlock) {
				if (clauseBlock.isInsertionMarker()) {
					clauseBlock = clauseBlock.getNextBlock();
					continue;
				}
				switch (clauseBlock.type) {
					case "controls_if_elseif":
						this.elseifCount_++;
						valueConnections.push(
							clauseBlock.valueConnection_ as Connection | null,
						);
						statementConnections.push(
							clauseBlock.statementConnection_ as Connection | null,
						);
						break;
					case "controls_if_else":
						this.elseCount_++;
						elseStatementConnection =
							clauseBlock.statementConnection_ as Connection | null;
						break;
					default:
						throw TypeError(`Unknown block type: ${clauseBlock.type}`);
				}
				clauseBlock = clauseBlock.getNextBlock();
			}
			this.updateShape_();
			// Reconnect any child blocks.
			this.reconnectChildBlocks_(
				valueConnections,
				statementConnections,
				elseStatementConnection,
			);
		},

		saveConnections: function (this: IfBlock, containerBlock: Block) {
			let clauseBlock =
				containerBlock?.nextConnection?.targetBlock() as ClauseBlock | null;
			let i = 1;
			while (clauseBlock) {
				if (clauseBlock.isInsertionMarker()) {
					clauseBlock = clauseBlock.getNextBlock();
					continue;
				}
				switch (clauseBlock.type) {
					case "controls_if_elseif": {
						const inputIf = this.getInput(`IF${i}`);
						const inputDo = this.getInput(`DO${i}`);
						clauseBlock.valueConnection_ =
							inputIf?.connection?.targetConnection;
						clauseBlock.statementConnection_ =
							inputDo?.connection?.targetConnection;
						i++;
						break;
					}
					case "controls_if_else": {
						const inputDo = this.getInput("ELSE");
						clauseBlock.statementConnection_ =
							inputDo?.connection?.targetConnection;
						break;
					}
					default:
						throw TypeError(`Unknown block type: ${clauseBlock.type}`);
				}
				clauseBlock = clauseBlock.getNextBlock();
			}
		},

		rebuildShape_: function (this: IfBlock) {
			const valueConnections: Array<Connection | null> = [null];
			const statementConnections: Array<Connection | null> = [null];
			let elseStatementConnection: Connection | null = null;

			if (this.getInput("ELSE")) {
				elseStatementConnection = this.getInput("ELSE")?.connection
					?.targetConnection as Connection;
			}
			for (let i = 1; this.getInput(`IF${i}`); i++) {
				const inputIf = this.getInput(`IF${i}`);
				const inputDo = this.getInput(`DO${i}`);
				valueConnections.push(
					inputIf?.connection?.targetConnection as Connection,
				);
				statementConnections.push(
					inputDo?.connection?.targetConnection as Connection,
				);
			}
			this.updateShape_();
			this.reconnectChildBlocks_(
				valueConnections,
				statementConnections,
				elseStatementConnection,
			);
		},

		updateShape_: function (this: IfBlock) {
			// Delete everything.
			if (this.getInput("ELSE")) {
				this.removeInput("ELSE");
			}
			if (this.getInput("ELSELABEL")) {
				this.removeInput("ELSELABEL");
			}
			for (let i = 1; this.getInput(`IF${i}`); i++) {
				this.removeInput(`IF${i}`);
				this.removeInput(`DO${i}`);
			}
			// Rebuild block.
			for (let i = 1; i <= this.elseifCount_; i++) {
				this.appendValueInput(`IF${i}`)
					.setCheck("Boolean")
					.appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF);
				this.appendStatementInput(`DO${i}`).appendField(
					Blockly.Msg.CONTROLS_IF_MSG_THEN,
				);
			}
			if (this.elseCount_) {
				this.appendDummyInput("ELSELABEL").appendField(
					Blockly.Msg.CONTROLS_IF_MSG_ELSE,
				);
				this.appendStatementInput("ELSE");
			}
		},

		reconnectChildBlocks_: function (
			this: IfBlock,
			valueConnections: Array<Connection | null>,
			statementConnections: Array<Connection | null>,
			elseStatementConnection: Connection | null,
		) {
			for (let i = 1; i <= this.elseifCount_; i++) {
				valueConnections[i]?.reconnect(this, `IF${i}`);
				statementConnections[i]?.reconnect(this, `DO${i}`);
			}
			if (elseStatementConnection) {
				elseStatementConnection.reconnect(this, "ELSE");
			}
		},
	};

	type IfBlock = Block & IfMixin;
	interface IfMixin extends IfMixinType {}
	type IfMixinType = typeof CONTROLS_IF_MUTATOR_MIXIN;

	const PROCEDURE_SELECT_EXTENSION = function (this: Block) {
		const input = this.getInput("METHOD");
		if (!input) return;

		input.appendField(
			new blockly.FieldDropdown(() => {
				let procedures = procedureManager.procedures;
				if (this.type !== "mesh_add_procedure")
					procedures = procedures.filter((e) => e.remote);

				const names = procedures.map((procedure) => [
					procedure.name,
					procedure.funcName,
				]);

				return (
					names.length > 0 ? names : [["name", "name"]]
				) as Blockly.MenuOption[];
			}) as Blockly.Field,
			"METHOD",
		);
	};

	const PROCEDURE_ARGUMENTS_EXTENSION = {
		state: [] as { id: string; name: string }[],
		inputs: [] as string[],

		construct(this: Block & { updateShape: () => void }) {
			this.setOnChange(this.updateShape.bind(this));
		},

		updateShape(this: Block & { inputs: string[] }) {
			if (this.isInFlyout) return;

			const procedure = procedureManager.getProcedure(
				this.getFieldValue("METHOD"),
			);
			if (!procedure) return;

			if (this.inputs.length === 0 && procedure.arguments.length !== 0) {
				this.appendDummyInput("WITH").appendField(
					"%{BKY_PROCEDURES_BEFORE_PARAMS}",
				);
				this.appendEndRowInput("WITH_BRK");
			}
			if (this.inputs.length !== 0 && procedure.arguments.length === 0) {
				this.removeInput("WITH");
				this.removeInput("WITH_BRK");
			}

			this.inputs.forEach((id) => {
				if (procedureManager.hasArgument(procedure, id)) return;

				this.removeInput(`${id}_label`);
				this.removeInput(id);
				this.removeInput(`${id}_end`);
			});
			procedure.arguments.forEach(({ id, name }) => {
				if (this.inputs.includes(id)) return;

				this.appendDummyInput(`${id}_label`).appendField(
					new blockly.FieldLabel(`${name}: `),
				);
				this.appendValueInput(id);
				this.appendEndRowInput(`${id}_end`);
			});

			if (procedure.arguments.length !== 0) {
				procedure.arguments.reduceRight((prev, curr) => {
					this.moveInputBefore(`${curr.id}_end`, `${prev.id}_label`);
					this.moveInputBefore(curr.id, `${curr.id}_end`);
					this.moveInputBefore(`${curr.id}_label`, curr.id);

					return curr;
				});
			}

			this.inputs = procedure.arguments.map(({ id }) => id);
		},

		saveExtraState() {
			return {};
		},
		loadExtraState(this: Block & { updateShape: () => void }) {
			this.updateShape();
		},
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
	blockly.Extensions.register("list_select_extension", LIST_SELECT_EXTENSION);
	blockly.Extensions.register(
		"appendStatementInputStack",
		APPEND_STATEMENT_INPUT_STACK,
	);
	blockly.Extensions.registerMutator(
		"l_controls_if_mutator",
		CONTROLS_IF_MUTATOR_MIXIN,
		undefined,
		["controls_if_elseif", "controls_if_else"],
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
	blockly.Extensions.register(
		"procedure_select_extension",
		PROCEDURE_SELECT_EXTENSION,
	);
	blockly.Extensions.registerMutator(
		"procedure_arguments_extension",
		PROCEDURE_ARGUMENTS_EXTENSION,
		PROCEDURE_ARGUMENTS_EXTENSION.construct,
	);
}
