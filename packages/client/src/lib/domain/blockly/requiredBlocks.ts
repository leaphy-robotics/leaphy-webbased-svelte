/**
 * Some blocks need another block in the program to do anything:
 * - setup: the LED strip, a display or Bluetooth has to be set up first. Without it the
 *   program doesn't work at all, so it can't be uploaded.
 * - show: changes only become visible after a "show" block (e.g. the LED strip).
 * - update: Bluetooth and the mesh network only work while an update block keeps running.
 *
 * Students easily forget these, so we warn on the blocks themselves and before uploading.
 */
import * as Blockly from "blockly";

export type RequirementKind = "setup" | "show" | "update";

/** Order of the kinds in the upload popup, the ones that block uploading first */
export const REQUIREMENT_KINDS: RequirementKind[] = ["setup", "show", "update"];

/** Kinds the program can't be uploaded without */
const REQUIRED_KINDS = new Set<RequirementKind>(["setup"]);

/** Message shown on blocks that need the missing block, %1 is the missing block */
const WARNINGS: Record<RequirementKind, string> = {
	setup: "SETUP_BLOCK_MISSING",
	show: "SHOW_BLOCK_MISSING",
	update: "UPDATE_BLOCK_MISSING",
};

interface Requirement {
	kind: RequirementKind;
	/** The block that has to be in the program */
	block: Blockly.serialization.blocks.State;
	/** Blocks that need it */
	neededBy: string[];
}

export interface MissingBlock {
	kind: RequirementKind;
	/** The missing block, as it's shown in the popup */
	block: Blockly.serialization.blocks.State;
	/** The program can't be uploaded without it */
	required: boolean;
}

const number = (value: number) => ({
	shadow: { type: "math_number", fields: { NUM: value } },
});

function setup(type: string, neededBy: string[]): Requirement {
	return { kind: "setup", block: { type }, neededBy };
}

function display(prefix: string): Requirement {
	return {
		kind: "show",
		block: { type: `${prefix}_display` },
		neededBy: [
			`${prefix}_clear`,
			`${prefix}_set_text_size`,
			`${prefix}_print_line`,
			`${prefix}_print_value`,
		],
	};
}

const LEDSTRIP_COLOR = [
	"leaphy_led_strip_set_led",
	"leaphy_led_strip_fill",
	"leaphy_led_strip_brightness",
];

const REQUIREMENTS: Requirement[] = [
	{
		kind: "setup",
		block: { type: "leaphy_led_strip_setup", inputs: { LEDS: number(30) } },
		neededBy: [
			...LEDSTRIP_COLOR,
			"leaphy_led_strip_show",
			"leaphy_led_strip_count",
		],
	},
	{
		kind: "show",
		block: { type: "leaphy_led_strip_show" },
		neededBy: LEDSTRIP_COLOR,
	},
	display("leaphy_display"),
	display("leaphy_display_large"),
	setup("leaphy_matrix_init", [
		"leaphy_matrix_fill",
		"leaphy_matrix_set",
		"leaphy_matrix_set_brightness",
		"leaphy_matrix_clear",
	]),
	setup("leaphy_segment_init", [
		"leaphy_segment_set",
		"leaphy_segment_clear",
		"leaphy_segment_set_brightness",
	]),
	setup("leaphy_sound_init", [
		"leaphy_sound_play",
		"leaphy_sound_set_volume",
		"leaphy_sound_stop",
	]),
	setup("ble_setup", ["ble_update", "ble_is_pressed"]),
	{
		kind: "update",
		block: { type: "ble_update" },
		neededBy: ["ble_setup", "ble_is_pressed"],
	},
	setup("mesh_setup", [
		"mesh_update",
		"mesh_sender",
		"mesh_on_signal",
		"mesh_broadcast_signal",
		"mesh_call_signal",
	]),
	{
		kind: "update",
		block: { type: "mesh_update" },
		neededBy: [
			"mesh_setup",
			"mesh_on_signal",
			"mesh_broadcast_signal",
			"mesh_call_signal",
		],
	},
	setup("ml_classify", ["ml_certainty"]),
];

function hasEnabled(workspace: Blockly.Workspace, type: string) {
	return workspace
		.getBlocksByType(type, false)
		.some((block) => block.isEnabled());
}

function isMissing(workspace: Blockly.Workspace, requirement: Requirement) {
	return !hasEnabled(workspace, requirement.block.type);
}

function isNeeded(workspace: Blockly.Workspace, requirement: Requirement) {
	return requirement.neededBy.some((type) => hasEnabled(workspace, type));
}

/** Blocks the program needs but doesn't have (or only has disabled). */
export function getMissingBlocks(workspace: Blockly.Workspace): MissingBlock[] {
	return REQUIREMENTS.filter(
		(requirement) =>
			isMissing(workspace, requirement) && isNeeded(workspace, requirement),
	)
		.map((requirement) => ({
			kind: requirement.kind,
			block: requirement.block,
			required: REQUIRED_KINDS.has(requirement.kind),
		}))
		.sort(
			(a, b) =>
				REQUIREMENT_KINDS.indexOf(a.kind) - REQUIREMENT_KINDS.indexOf(b.kind),
		);
}

/** The text of a block, e.g. "Stel ledstrip in op pin 2 met 30 leds" */
function blockText(state: Blockly.serialization.blocks.State) {
	const workspace = new Blockly.Workspace();
	Blockly.Events.disable();
	try {
		return Blockly.serialization.blocks.append(state, workspace).toString();
	} finally {
		Blockly.Events.enable();
		workspace.dispose();
	}
}

/** Warn on blocks that need another block while the program doesn't have it. */
export function warnMissingBlocks(workspace: Blockly.WorkspaceSvg) {
	// Only touch blocks whose warning changes, setting a warning re-renders the block
	const warned = new Map(
		REQUIREMENTS.map((requirement) => [
			requirement,
			new WeakSet<Blockly.Block>(),
		]),
	);

	workspace.addChangeListener((event: Blockly.Events.Abstract) => {
		if (event.isUiEvent) return;

		for (const requirement of REQUIREMENTS) {
			const missing = isMissing(workspace, requirement);
			const blocks = warned.get(requirement) as WeakSet<Blockly.Block>;
			const id = `missing_${requirement.block.type}`;
			let warning: string | undefined;

			for (const type of requirement.neededBy) {
				for (const block of workspace.getBlocksByType(type, false)) {
					if (blocks.has(block) === missing) continue;

					if (missing) {
						warning ??= Blockly.Msg[WARNINGS[requirement.kind]]?.replace(
							"%1",
							blockText(requirement.block),
						);
						blocks.add(block);
					} else {
						blocks.delete(block);
					}
					block.setWarningText(missing ? warning : null, id);
				}
			}
		}
	});
}
