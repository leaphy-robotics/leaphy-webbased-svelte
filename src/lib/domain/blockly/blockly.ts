import * as Blockly from "blockly";
import "@blockly/field-bitmap";
import Prompt from "$components/core/popups/popups/Prompt.svelte";
import { type RobotDevice, inFilter } from "$domain/robots";
import { RobotType } from "$domain/robots.types";
import { audio } from "$state/blockly.svelte";
import { popups } from "$state/popup.svelte";
import { BackpackChange } from "@blockly/workspace-backpack";
import {
	CATEGORIES,
	EXTENSIONS,
	blocks,
	translations,
} from "@leaphy-robotics/leaphy-blocks";
import { type WorkspaceSvg, serialization } from "blockly";
import type { Workspace } from "blockly";
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

Blockly.Extensions.register(
	"appendStatementInputStack",
	EXTENSIONS.APPEND_STATEMENT_INPUT_STACK,
);
Blockly.Extensions.register(
	"list_select_extension",
	EXTENSIONS.LIST_SELECT_EXTENSION,
);

Blockly.Extensions.registerMutator(
	"l_controls_if_mutator",
	EXTENSIONS.CONTROLS_IF_MUTATOR_MIXIN,
	null as unknown as undefined, // TODO(#6920)
	["controls_if_elseif", "controls_if_else"],
);

Blockly.dialog.setPrompt(async (_, defaultValue, callback) => {
	const name = await popups.open({
		component: Prompt,
		data: {
			name: "NAME_VARIABLE_PROMPT_INPUT",
			placeholder: "NAME_VARIABLE_PROMPT_INPUT",
			value: defaultValue,
			confirm: "OK_VARIABLE",
		},
		allowInteraction: false,
	});
	if (name) callback(name);
});

const play = Blockly.WorkspaceAudio.prototype.play;
Blockly.WorkspaceAudio.prototype.play = function (name, opt_volume) {
	audio.update((state) => {
		if (state) play.call(this, name, opt_volume);
		return state;
	});
};

function loadToolbox(robot: RobotDevice): ToolboxDefinition {
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
		// It's not JSON, maybe it's XML
		const xml = Blockly.utils.xml.textToDom(content);
		workspace.clear();
		Blockly.Xml.domToWorkspace(xml, workspace);
	}
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
			startScale: 0.8,
		},
	});

	Blockly.serialization.workspaces.load(
		content || {
			blocks: {
				languageVersion: 0,
				blocks: [
					{
						type: "leaphy_start",
						id: "rzE0Ve:6bHB~8aIqyj-U",
						deletable: false,
						x: 500,
						y: 10,
					},
				],
			},
		},
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
