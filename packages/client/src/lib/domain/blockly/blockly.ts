import type { Workspace } from "blockly";
import * as Blockly from "blockly";
import { ContextMenuRegistry, type WorkspaceSvg, serialization } from "blockly";
import "@blockly/field-bitmap";
import defaultProgram from "$assets/default-program.json?raw";
import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Prompt from "$components/core/popups/popups/Prompt.svelte";
import { PseudoSerializer, explainBlockOption } from "$domain/blockly/pseudo";
import { type RobotDevice, inFilter } from "$domain/robots";
import { RobotType } from "$domain/robots.types";
import {
	CATEGORIES,
	ProcedureSerializer,
	blocks,
	registerExtensions,
	translations,
} from "$leaphy_blocks";
import BlocklyState from "$state/blockly.svelte";
import PopupState from "$state/popup.svelte";
import { BackpackChange } from "@blockly/workspace-backpack";
import type {
	CategoryInfo,
	ToolboxDefinition,
} from "blockly/core/utils/toolbox";
import { Backpack } from "./backpack";
import { LeaphyCategory } from "./category-ui/category";
import { LeaphyToolbox } from "./category-ui/toolbox";
import PinSelectorField from "./fields";
import toolbox from "./toolbox";

Blockly.defineBlocksWithJsonArray(blocks);
Blockly.fieldRegistry.register("field_pin_selector", PinSelectorField);
Blockly.registry.register(
	Blockly.registry.Type.TOOLBOX_ITEM,
	Blockly.ToolboxCategory.registrationName,
	LeaphyCategory,
	true,
);
Blockly.registry.register(
	Blockly.registry.Type.TOOLBOX,
	Blockly.CollapsibleToolboxCategory.registrationName,
	LeaphyToolbox,
);
Blockly.registry.register(
	Blockly.registry.Type.SERIALIZER,
	"lists",
	new CATEGORIES.ListSerializer(),
);
Blockly.registry.register(
	Blockly.registry.Type.SERIALIZER,
	"procedures",
	new ProcedureSerializer(),
);
Blockly.registry.register(
	Blockly.registry.Type.SERIALIZER,
	"pseudo",
	new PseudoSerializer(),
);

registerExtensions(Blockly);

Blockly.dialog.setPrompt(async (_, defaultValue, callback) => {
	const name = await PopupState.open({
		component: Prompt,
		data: {
			name: "NAME_VARIABLE_PROMPT_INPUT",
			placeholder: "NAME_VARIABLE_PROMPT_INPUT",
			value: defaultValue,
			confirm: "OK_VARIABLE",
		},
		allowInteraction: false,
	});
	if (name) callback(name as string);
});

const play = Blockly.WorkspaceAudio.prototype.play;
Blockly.WorkspaceAudio.prototype.play = function (name, opt_volume) {
	if (!BlocklyState.audio) return;

	play.call(this, name, opt_volume);
};

export function loadToolbox(robot: RobotDevice): ToolboxDefinition {
	return {
		kind: "categoryToolbox",
		contents: toolbox
			.filter(({ robots }) => (robots ? inFilter(robot, robots) : true))
			.map((category) => {
				const result: Record<string, any> = {
					kind: "category",
					toolboxitemid: category.id.replace("%robot%", robot.id),
					name: category.name,
					categorystyle: category.style,
				};

				if (category.custom) result.custom = category.custom;
				if (!category.groups) return result as CategoryInfo;

				result.contents = category.groups.flatMap((group) => {
					return group
						.filter(({ robots }) => (robots ? inFilter(robot, robots) : true))
						.flatMap((block) => [
							{ kind: "sep", gap: "8" },
							{ kind: "block", ...block },
						])
						.slice(1);
				});

				return result as CategoryInfo;
			}),
	};
}

export function isCompatible(workspace: WorkspaceSvg, robot: RobotDevice) {
	let incompatible = new Set<string>();
	let compatible = new Set<string>();
	for (const category of toolbox) {
		if (category.robots && !inFilter(robot, category.robots)) {
			if (category.id === "l_lists") {
				for (const block of blocks) {
					if (block.style === "list_blocks") incompatible.add(block.type);
				}
			} else {
				for (const block of category.groups.flat()) {
					incompatible.add(block.type);
				}
			}
		} else if (!category.custom) {
			for (const block of category.groups.flat()) {
				if ("robots" in block && !inFilter(robot, block.robots))
					incompatible.add(block.type);
				else compatible.add(block.type);
			}
		}
	}

	for (const block of compatible) {
		incompatible.delete(block);
	}
	return !Array.from(incompatible.values()).find((block) => {
		if (block === "text") return false;

		return !!workspace.getBlocksByType(block).length;
	});
}

export function setLocale(robot: RobotDevice, locale: string) {
	const translation = translations[locale];
	Blockly.setLocale(translation);
	if (robot.type === RobotType.L_FLITZ_NANO) {
		translation.ARD_SERVO_WRITE = translation.ARD_SERVO_ARM_WRITE;
	} else {
		translation.ARD_SERVO_WRITE = translation.ARD_SERVO_REGULAR_WRITE;
	}
}

// Load a workspace from a JSON or XML string
export function loadWorkspaceFromString(content: string, workspace: Workspace) {
	try {
		const json = JSON.parse(content);
		serialization.workspaces.load(json, workspace);
	} catch {
		try {
			// It's not JSON, maybe it's XML
			const xml = Blockly.utils.xml.textToDom(content);
			workspace.clear();
			Blockly.Xml.domToWorkspace(xml, workspace);
		} catch {
			PopupState.open({
				component: ErrorPopup,
				data: {
					title: "INVALID_WORKSPACE",
					message: "INVALID_WORKSPACE_MESSAGE",
				},
				allowInteraction: false,
			});
			return false;
		}
	}

	return true;
}

export function setupWorkspace(
	robot: RobotDevice,
	element: HTMLDivElement,
	theme: Blockly.Theme,
	content?: { [key: string]: any },
) {
	PinSelectorField.processPinMappings(robot);

	const workspace = Blockly.inject(element, {
		renderer: "zelos",
		media: "blockly-assets",
		toolbox: loadToolbox(robot),
		theme: theme,
		zoom: {
			controls: true,
			startScale: 0.8,
		},
	});

	Blockly.serialization.workspaces.load(
		content || JSON.parse(defaultProgram),
		workspace,
	);

	const toolbox = workspace.getToolbox();
	workspace.registerToolboxCategoryCallback("LISTS", CATEGORIES.LISTS);
	toolbox.getFlyout().autoClose = false;
	toolbox.selectItemByPosition(0);
	toolbox.refreshTheme();

	const backpack = new Backpack(workspace);
	Blockly.registry.unregister(Blockly.registry.Type.SERIALIZER, "backpack");

	backpack.setContents(JSON.parse(localStorage.getItem("backpack")) || []);
	workspace.addChangeListener((event: Blockly.Events.Abstract) => {
		if (!(event instanceof BackpackChange)) return;

		localStorage.setItem("backpack", JSON.stringify(backpack.getContents()));
	});
	workspace.addChangeListener(Blockly.Events.disableOrphans);

	backpack.init();

	return workspace;
}

ContextMenuRegistry.registry.register(explainBlockOption);
