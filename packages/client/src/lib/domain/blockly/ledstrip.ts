/**
 * Ready-made LED strip subprograms. The toolbox only shows a call to each of them, and
 * the subprogram itself is added once a student uses that call, so they can still see
 * and change how it works.
 *
 * Names are message references (%{BKY_...}); they are resolved when they are used, so
 * the subprograms and their variables are named in the current language.
 */

import * as Blockly from "blockly";
import { resolveMessages } from "./messages";

type Input = Record<string, unknown>;
type Block = Record<string, unknown>;

/** Space between the added subprogram and the rest of the program */
const SUBPROGRAM_GAP = 50;

const msg = (key: string) => `%{BKY_LEAPHY_LED_STRIP_${key}}`;

function num(value: number): Input {
	return { shadow: { type: "math_number", fields: { NUM: value } } };
}

function block(value: Block): Input {
	return { block: value };
}

function variable(key: string): Input {
	return block({ type: "variables_get", fields: { VAR: { name: msg(key) } } });
}

function count(): Input {
	return block({ type: "leaphy_led_strip_count" });
}

function arithmetic(op: string, a: Input, b: Input): Input {
	return block({
		type: "math_arithmetic",
		fields: { OP: op },
		inputs: { A: a, B: b },
	});
}

function map(
	value: Input,
	fromHigh: Input,
	toLow: Input,
	toHigh: Input,
): Input {
	return block({
		type: "math_map",
		inputs: {
			VALUE: value,
			FROM_LOW: num(0),
			FROM_HIGH: fromHigh,
			TO_LOW: toLow,
			TO_HIGH: toHigh,
		},
	});
}

/** Chain statement blocks together with `next`. */
function sequence(...blocks: Block[]): Block {
	return blocks.reduceRight((next, current) => ({
		...current,
		next: { block: next },
	}));
}

function repeat(
	key: string,
	from: Input,
	to: Input,
	by: Input,
	...body: Block[]
): Block {
	return {
		type: "controls_for",
		fields: { VAR: { name: msg(key) } },
		inputs: { FROM: from, TO: to, BY: by, DO: { block: sequence(...body) } },
	};
}

function wait(ms: number): Block {
	return {
		type: "time_delay",
		fields: { UNIT: "ms" },
		inputs: { DELAY_TIME_MILI: num(ms) },
	};
}

type Format = "RGB" | "HSV";

function colorInputs(first: Input, second: Input, third: Input) {
	return { CHANNEL_1: first, CHANNEL_2: second, CHANNEL_3: third };
}

function setLed(
	format: Format,
	led: Input,
	first: Input,
	second: Input,
	third: Input,
): Block {
	return {
		type: "leaphy_led_strip_set_led",
		// Stack the inputs, the calculations in them make the block very wide otherwise
		inline: false,
		fields: { FORMAT: format },
		inputs: { LED: led, ...colorInputs(first, second, third) },
	};
}

function fill(red: Input, green: Input, blue: Input): Block {
	return {
		type: "leaphy_led_strip_fill",
		fields: { FORMAT: "RGB" },
		inputs: colorInputs(red, green, blue),
	};
}

function brightness(value: Input): Block {
	return {
		type: "leaphy_led_strip_brightness",
		inputs: { BRIGHTNESS: value },
	};
}

function setVariable(key: string, value: number): Block {
	return {
		type: "variables_set",
		fields: { VAR: { name: msg(key) } },
		inputs: { VALUE: num(value) },
	};
}

/** Set the color variables the subprogram uses, so it's easy to change the color. */
function color(red: number, green: number, blue: number) {
	return [
		setVariable("VAR_RED", red),
		setVariable("VAR_GREEN", green),
		setVariable("VAR_BLUE", blue),
	];
}

const show: Block = { type: "leaphy_led_strip_show" };
const clear = fill(num(0), num(0), num(0));

function subprogram(name: string, ...body: Block[]): Block {
	return {
		type: "procedures_defnoreturn",
		fields: { NAME: msg(name) },
		inputs: { STACK: { block: sequence(...body) } },
	};
}

/** The color variable scaled by how far `key` is between 0 and `high`. */
function scaled(key: string, high: Input) {
	return (color: string) => map(variable(key), high, num(0), variable(color));
}

const halfStrip = () => arithmetic("DIVIDE", count(), num(2));

// Fade the whole strip in and out in one color
function breathe() {
	const step = [brightness(variable("VAR_BRIGHTNESS")), show, wait(20)];

	return subprogram(
		"SUB_BREATHE",
		...color(0, 120, 255),
		fill(variable("VAR_RED"), variable("VAR_GREEN"), variable("VAR_BLUE")),
		repeat("VAR_BRIGHTNESS", num(0), num(255), num(5), ...step),
		repeat("VAR_BRIGHTNESS", num(255), num(0), num(5), ...step),
		// Back to full brightness for other blocks, it's shown with the next colors
		brightness(num(255)),
	);
}

// Move a rainbow along the strip
function rainbow() {
	return subprogram(
		"SUB_RAINBOW",
		repeat(
			"VAR_HUE",
			num(0),
			num(255),
			num(5),
			repeat(
				"VAR_LED",
				num(0),
				arithmetic("MINUS", count(), num(1)),
				num(1),
				setLed(
					"HSV",
					variable("VAR_LED"),
					arithmetic(
						"ADD",
						variable("VAR_HUE"),
						map(variable("VAR_LED"), count(), num(0), num(255)),
					),
					num(255),
					num(255),
				),
			),
			show,
			wait(20),
		),
	);
}

// Move a fading tail of one color along the strip
function colorWave() {
	const fade = scaled("VAR_LED", halfStrip());

	return subprogram(
		"SUB_COLOR_WAVE",
		...color(255, 0, 80),
		repeat(
			"VAR_STEP",
			num(0),
			arithmetic("MINUS", count(), num(1)),
			num(1),
			clear,
			repeat(
				"VAR_LED",
				num(0),
				halfStrip(),
				num(1),
				setLed(
					"RGB",
					arithmetic("ADD", variable("VAR_STEP"), variable("VAR_LED")),
					fade("VAR_RED"),
					fade("VAR_GREEN"),
					fade("VAR_BLUE"),
				),
			),
			show,
			wait(50),
		),
	);
}

// Move a fading rainbow tail along the strip
function rainbowWave() {
	return subprogram(
		"SUB_RAINBOW_WAVE",
		repeat(
			"VAR_STEP",
			num(0),
			arithmetic("MINUS", count(), num(1)),
			num(1),
			clear,
			repeat(
				"VAR_LED",
				num(0),
				halfStrip(),
				num(1),
				setLed(
					"HSV",
					arithmetic("ADD", variable("VAR_STEP"), variable("VAR_LED")),
					map(variable("VAR_LED"), halfStrip(), num(0), num(255)),
					num(255),
					map(variable("VAR_LED"), halfStrip(), num(10), num(255)),
				),
			),
			show,
			wait(50),
		),
	);
}

const SUBPROGRAMS = [breathe(), rainbow(), colorWave(), rainbowWave()];

/** Toolbox calls to the ready-made subprograms */
export const ledstripSubprogramCalls = SUBPROGRAMS.map((definition) => ({
	type: "procedures_callnoreturn",
	extraState: { name: (definition.fields as { NAME: string }).NAME },
}));

/** Place a new block to the right of the program, so it doesn't cover other blocks */
function freeSpot(workspace: Blockly.WorkspaceSvg, ignore: Blockly.Block) {
	const others = workspace
		.getTopBlocks(false)
		.filter((block) => block !== ignore)
		.map((block) => (block as Blockly.BlockSvg).getBoundingRectangle());
	if (others.length === 0) return { x: 0, y: 0 };

	return {
		x: Math.max(...others.map((bounds) => bounds.right)) + SUBPROGRAM_GAP,
		y: Math.min(...others.map((bounds) => bounds.top)),
	};
}

/** The ready-made subprogram with this name, in the current language */
function findSubprogram(name: string) {
	return SUBPROGRAMS.map(resolveMessages).find(
		(item) => (item.fields as { NAME: string }).NAME === name,
	);
}

/** Calls in `block` (and the blocks inside it) to a ready-made subprogram that's missing. */
function missingSubprogramCalls(block: Blockly.Block) {
	return block
		.getDescendants(false)
		.filter(
			(call) =>
				call.type === "procedures_callnoreturn" &&
				!Blockly.Procedures.getDefinition(
					call.getFieldValue("NAME"),
					block.workspace,
				) &&
				findSubprogram(call.getFieldValue("NAME")),
		);
}

/**
 * The call block adds an empty subprogram as soon as it's created without one. For the
 * ready-made subprograms we add the full one ourselves, once the call is dropped.
 */
let skippingEmptySubprograms = false;
function skipEmptySubprograms() {
	// The workspace is set up again when switching robots, only patch the block once
	if (skippingEmptySubprograms) return;
	skippingEmptySubprograms = true;

	const definition = Blockly.Blocks.procedures_callnoreturn;
	const onchange = definition.onchange;

	definition.onchange = function (
		this: Blockly.Block,
		event: Blockly.Events.Abstract,
	) {
		if (
			event.type === Blockly.Events.BLOCK_CREATE &&
			(event as Blockly.Events.BlockCreate).ids?.includes(this.id) &&
			missingSubprogramCalls(this).includes(this)
		) {
			return;
		}
		onchange.call(this, event);
	};
}

function addSubprograms(
	workspace: Blockly.WorkspaceSvg,
	calls: Blockly.Block[],
	group: string,
) {
	// Group with the drop, so undo removes the call and the subprogram together
	const previous = Blockly.Events.getGroup();
	Blockly.Events.setGroup(group);

	for (const call of calls) {
		const name = call.getFieldValue("NAME");
		const definition = findSubprogram(name);
		// A call earlier in the list may have added it already
		if (!definition || Blockly.Procedures.getDefinition(name, workspace))
			continue;

		Blockly.serialization.blocks.append(
			{
				...definition,
				...freeSpot(workspace, call),
			} as Blockly.serialization.blocks.State,
			workspace,
			{ recordUndo: true },
		);
	}

	Blockly.Events.setGroup(previous);
}

/**
 * Add a ready-made subprogram when a call to it is dropped on the workspace and the
 * subprogram isn't there yet. Calls that are pasted or duplicated get it right away.
 */
export function addDroppedSubprograms(workspace: Blockly.WorkspaceSvg) {
	skipEmptySubprograms();

	workspace.addChangeListener((event: Blockly.Events.Abstract) => {
		if (event.type === Blockly.Events.BLOCK_DRAG) {
			const drag = event as Blockly.Events.BlockDrag;
			if (drag.isStart || !drag.blockId) return;

			// Gone when the call was dropped on the toolbox or the trash can
			const block = workspace.getBlockById(drag.blockId);
			if (!block || block.isDisposed()) return;

			addSubprograms(workspace, missingSubprogramCalls(block), event.group);
			return;
		}

		// Undo and redo bring back the subprogram together with the call
		if (event.type !== Blockly.Events.BLOCK_CREATE || !event.recordUndo) return;
		// A call taken from the toolbox is still being dragged, wait for the drop
		if (workspace.isDragging()) return;

		const block = workspace.getBlockById(
			(event as Blockly.Events.BlockCreate).blockId ?? "",
		);
		if (!block) return;
		addSubprograms(workspace, missingSubprogramCalls(block), event.group);
	});
}
