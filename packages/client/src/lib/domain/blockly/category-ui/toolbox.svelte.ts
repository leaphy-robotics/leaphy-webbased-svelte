import ToolboxComponent from "$components/workspace/blocks/Toolbox.svelte";
import * as Blockly from "blockly";
import type { ISelectableToolboxItem } from "blockly";
import { mount } from "svelte";

export default class LeaphyToolbox extends Blockly.Toolbox {
	component: ReturnType<typeof mount>;
	element: HTMLDivElement;
	props = $state<{
		toolboxDef: Blockly.utils.toolbox.ToolboxItemInfo[];
		workspace: Blockly.Workspace;
		selected: string;
	}>({ toolboxDef: undefined, workspace: undefined, selected: null });

	getRestoredFocusableNode() {
		return this;
	}

	getFocusableElement(): HTMLElement | SVGElement {
		return this.contentsDiv_.querySelector('div[id="focusable"]');
	}

	renderContents_(toolboxDef: Blockly.utils.toolbox.ToolboxItemInfo[]) {
		const fragment = document.createDocumentFragment();
		for (let i = 0; i < toolboxDef.length; i++) {
			const toolboxItemDef = toolboxDef[i];
			(this as any).createToolboxItem(toolboxItemDef, fragment);
		}

		this.props.toolboxDef = toolboxDef;
		this.props.workspace = this.workspace_;
		if (!this.component) {
			this.component = mount(ToolboxComponent, {
				target: this.contentsDiv_,
				props: this.props,
			});
		}
	}

	selectItem_(
		oldItem: ISelectableToolboxItem,
		newItem: ISelectableToolboxItem,
	) {
		super.selectItem_(oldItem, newItem);
		this.props.selected = newItem.getId();
	}

	deselectItem_(item: ISelectableToolboxItem) {
		super.deselectItem_(item);
		this.props.selected = null;
	}
}

Blockly.Css.register(`
	.blocklyToolbox {
		background-color: transparent !important;
		padding: 0 !important;
	}

	.blocklyToolboxCategoryGroup {
		height: 100%;
	}
`);
