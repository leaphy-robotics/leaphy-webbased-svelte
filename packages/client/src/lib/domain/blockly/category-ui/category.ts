import * as Blockly from "blockly/core";

/**
 * Custom Leaphy implementation of a Blockly toolbox category
 * Extends the base category with custom icon and label styling
 */
export class LeaphyCategory extends Blockly.ToolboxCategory {
	static readonly registrationName = "category";

	/**
	 * Creates the Leaphy-styled label with icon and text
	 */
	protected override createLabelDom_(name: string): HTMLDivElement {
		const container = document.createElement("div");
		container.setAttribute("id", `${this.getId()}.label`);
		container.style.position = "relative";

		const icon = document.createElement("img");
		icon.setAttribute("src", `blockly-assets/${this.getId()}.svg`);
		icon.setAttribute("height", "72px");
		icon.setAttribute("width", "72px");
		icon.style.marginLeft = "0px";
		container.appendChild(icon);

		const textLabel = document.createElement("div");
		Object.assign(textLabel.style, {
			top: "40px",
			width: "50px",
			marginLeft: "11px",
			position: "absolute",
			fontSize: "10px",
			lineHeight: "99%",
			textAlign: "center",
			verticalAlign: "top",
			whiteSpace: "pre-wrap",
		});
		textLabel.textContent = name;
		container.appendChild(textLabel);

		return container;
	}
}

// CSS registration
Blockly.Css.register(`
.blocklyTreeRow:not(.blocklyTreeSelected):hover {
  background-color: rgba(255, 255, 255, .2);
}

.blocklyTreeSelected {
  background-color: rgba(255, 255, 255, .3);
}

.blocklyToolboxCategory {
  padding-right: 0;
  height: unset;
  margin: 1px 0px 1px 0;
}

.blocklyTreeRowContentContainer {
  text-align: center;
  height: 72px;
  max-width: 72px;
  margin-bottom: 0px;
  padding: 0px;
}

.blocklyTreeIcon {
  background-image: url(<<<PATH>>>/sprites.png);
  height: 16px;
  vertical-align: middle;
  visibility: hidden;
  width: 16px;
}

.blocklyTreeIconClosed {
  background-position: -32px -1px;
}

.blocklyToolboxDiv[dir="RTL"] .blocklyTreeIconClosed {
  background-position: 0 -1px;
}

.blocklyTreeSelected>.blocklyTreeIconClosed {
  background-position: -32px -17px;
}

.blocklyToolboxDiv[dir="RTL"] .blocklyTreeSelected>.blocklyTreeIconClosed {
  background-position: 0 -17px;
}

.blocklyTreeIconOpen {
  background-position: -16px -1px;
}

.blocklyTreeSelected>.blocklyTreeIconOpen {
  background-position: -16px -17px;
}

.blocklyTreeLabel {
  cursor: default;
  font: 16px sans-serif;
  padding: 0 3px;
  vertical-align: middle;
}

.blocklyToolboxDelete .blocklyTreeLabel {
  cursor: url("<<<PATH>>>/handdelete.cur"), auto;
}

.blocklyTreeSelected .blocklyTreeLabel {
  color: #fff;
}

.blocklyToolboxCategoryIcon {
  display: none !important;
}
`);
