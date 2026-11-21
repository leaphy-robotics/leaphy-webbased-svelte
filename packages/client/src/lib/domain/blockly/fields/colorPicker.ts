import * as Blockly from "blockly";
import ColorPickerState from "$state/colorPicker.svelte";

export interface ColorPickerKeys {
	/** Name of the value input holding the red channel. */
	r: string;
	/** Name of the value input holding the green channel. */
	g: string;
	/** Name of the value input holding the blue channel. */
	b: string;
}

export type ColorPickerFieldConfig = Blockly.FieldConfig & ColorPickerKeys;

const NUMBER_BLOCK = "math_number";
const NUMBER_FIELD = "NUM";
const INPUT_NAME = "COLOR_PICKER";
const SIZE = 32;
const BORDER = 1.5;

const clamp = (n: number) =>
	Number.isFinite(n) ? Math.min(255, Math.max(0, Math.round(n))) : 0;

function toHex(channels: number[]) {
	return `#${channels.map((c) => clamp(c).toString(16).padStart(2, "0")).join("")}`;
}

function fromHex(hex: string): number[] {
	const n = Number.parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * A field without a value of its own. It edits the r, g and b inputs of its
 * block through the color picker popup, and mirrors their values in a swatch.
 *
 * It is only shown while all three inputs hold plain number blocks. Because
 * it hides by hiding its parent input, it should live in its own dummy input:
 * use {@link addColorPicker} to add it to a block.
 */
export class ColorPickerField extends Blockly.Field<string> {
	override SERIALIZABLE = false;
	override EDITABLE = true;

	private readonly keys: string[];
	private color = "#000000";
	private editing = false;
	private swatch?: SVGCircleElement;
	private listenerWorkspace?: Blockly.Workspace;

	constructor(config: ColorPickerFieldConfig) {
		super("", null, config);
		this.keys = [config.r, config.g, config.b];
	}

	static override fromJson(config: ColorPickerFieldConfig) {
		return new ColorPickerField(config);
	}

	/** The NUM fields of the r, g and b blocks, or undefined if any input isn't a plain number. */
	private numberFields(): Blockly.Field[] | undefined {
		const block = this.getSourceBlock();
		if (!block) return;

		const fields: Blockly.Field[] = [];
		for (const key of this.keys) {
			const child = block.getInputTargetBlock(key);
			const field =
				child?.type === NUMBER_BLOCK && child.getField(NUMBER_FIELD);
			if (!field) return;
			fields.push(field);
		}
		return fields;
	}

	protected override initView() {
		this.size_ = new Blockly.utils.Size(SIZE, SIZE);
		this.fieldGroup_?.style.setProperty("cursor", "pointer");

		// Circles, not rects: Blockly's CSS forces `.blocklyEditableField > rect` to white.
		const center = SIZE / 2;
		Blockly.utils.dom.createSvgElement(
			Blockly.utils.Svg.CIRCLE,
			{ cx: center, cy: center, r: center, style: "fill: #fff" },
			this.fieldGroup_,
		);
		this.swatch = Blockly.utils.dom.createSvgElement(
			Blockly.utils.Svg.CIRCLE,
			{ cx: center, cy: center, r: center - BORDER },
			this.fieldGroup_,
		);
		this.swatch.style.fill = this.color;

		this.listenerWorkspace = this.getSourceBlock()?.workspace;
		this.listenerWorkspace?.addChangeListener(this.onWorkspaceChange);

		// Children get connected after the parent is created, so wait for them.
		queueMicrotask(() => this.sync());
	}

	protected override render_() {
		this.size_ = new Blockly.utils.Size(SIZE, SIZE);
	}

	private onWorkspaceChange = (event: Blockly.Events.Abstract) => {
		if (event.isUiEvent) return;
		this.sync();
	};

	/** Update visibility and swatch from the r, g and b input blocks. */
	private sync() {
		const block = this.getSourceBlock() as Blockly.BlockSvg | null;
		if (!block || block.isDisposed()) return;

		const fields = this.numberFields();
		const visible = fields !== undefined;

		const input = this.getParentInput();
		if (input.isVisible() !== visible) {
			input.setVisible(visible);
			block.queueRender();
		}

		if (!fields) {
			if (this.editing) ColorPickerState.close(false);
			return;
		}

		this.color = toHex(fields.map((f) => Number(f.getValue())));
		if (this.swatch) this.swatch.style.fill = this.color;
		if (this.editing) ColorPickerState.sync(this.color);
	}

	/** Write a color to the r, g and b blocks as part of an event group. */
	private write(channels: number[], group: string) {
		const fields = this.numberFields();
		if (!fields) return;

		const previous = Blockly.Events.getGroup();
		Blockly.Events.setGroup(group);
		fields.forEach((field, i) => {
			field.setValue(channels[i]);
		});
		Blockly.Events.setGroup(previous);
	}

	protected override showEditor_() {
		// Clicking the swatch while open closes the picker.
		if (this.editing) {
			ColorPickerState.close();
			return;
		}

		const fields = this.numberFields();
		if (!fields || !this.swatch) return;

		const original = fields.map((f) => Number(f.getValue()));
		const group = Blockly.utils.idGenerator.genUid();

		this.editing = true;
		// Centered on the swatch, below the block's own outline (not its whole stack).
		const block = this.getSourceBlock() as Blockly.BlockSvg;
		const outline = block.getSvgRoot().querySelector(".blocklyPath");

		ColorPickerState.open(this.swatch, this.color, hex => this.write(fromHex(hex), group))
			.then((result) => {
				this.editing = false;
				// Dismissed: put the original values back.
				if (result === undefined) this.write(original, group);
			});
	}

	override dispose() {
		this.listenerWorkspace?.removeChangeListener(this.onWorkspaceChange);
		if (this.editing) ColorPickerState.close(false);
		super.dispose();
	}
}

/** Add a color picker that edits the given r, g and b inputs to a block. */
export function addColorPicker(block: Blockly.Block, keys: ColorPickerKeys) {
	block.appendDummyInput(INPUT_NAME).appendField(new ColorPickerField(keys));
	// Show the swatch left of the r, g and b inputs.
	if (block.getInput(keys.r)) block.moveInputBefore(INPUT_NAME, keys.r);
}

/** Blocks that get a color picker, with their r, g and b input names. */
export const COLOR_PICKER_BLOCKS: Record<string, ColorPickerKeys> = {
	leaphy_original_set_led: { r: "LED_RED", g: "LED_GREEN", b: "LED_BLUE" },
	leaphy_led_set_basic: {
		r: "LED_BASIC_RED",
		g: "LED_BASIC_GREEN",
		b: "LED_BASIC_BLUE",
	},
	leaphy_led_strip_demo: {
		r: "LED_STRIP_DEMO_RED",
		g: "LED_STRIP_DEMO_GREEN",
		b: "LED_STRIP_DEMO_BLUE",
	},
	leaphy_flitz_led: { r: "FLITZ_LED_R", g: "FLITZ_LED_G", b: "FLITZ_LED_B" },
};

/**
 * Register the field and add it to {@link COLOR_PICKER_BLOCKS}.
 * Call after the block definitions are loaded.
 */
export function registerColorPickers() {
	Blockly.fieldRegistry.register("field_color_picker", ColorPickerField);

	for (const [type, keys] of Object.entries(COLOR_PICKER_BLOCKS)) {
		const definition = Blockly.Blocks[type];
		if (!definition?.init) continue;

		const init = definition.init;
		definition.init = function (this: Blockly.Block) {
			init.call(this);
			addColorPicker(this, keys);
		};
	}
}
