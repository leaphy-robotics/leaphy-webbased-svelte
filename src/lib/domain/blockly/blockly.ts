import * as Blockly from "blockly";
import "@blockly/field-bitmap";
import defaultProgram from "$assets/default-program.json?raw";
import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Explanation from "$components/core/popups/popups/Explanation.svelte";
import Prompt from "$components/core/popups/popups/Prompt.svelte";
import { type RobotDevice, inFilter } from "$domain/robots";
import { RobotType } from "$domain/robots.types";
import { audio } from "$state/blockly.svelte";
import { Anchor, popups } from "$state/popup.svelte";
import { BackpackChange } from "@blockly/workspace-backpack";
import {
	CATEGORIES,
	ProcedureSerializer,
	blocks,
	registerExtensions,
	translations,
} from "@leaphy-robotics/leaphy-blocks";
import {
	type Block,
	ContextMenuRegistry,
	type WorkspaceSvg,
	serialization,
} from "blockly";
import type { Workspace } from "blockly";
import type {
	CategoryInfo,
	ToolboxDefinition,
} from "blockly/core/utils/toolbox";
import { _ } from "svelte-i18n";
import { locale } from "svelte-i18n";
import { get } from "svelte/store";
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

registerExtensions(Blockly);

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
			popups.open({
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

function serializeBlock(
	block: Block,
	selected?: Block,
	indent = 0,
	inline = false,
) {
	if (!block) return "";

	const indentValue = "   ".repeat(indent);
	let value = indentValue;
	if (selected?.id === block.id)
		value += `**BEGIN_SELECT**${inline ? "" : `\n${indentValue}`}`;

	value += block.inputList
		.flatMap((input) => {
			const result = [];

			result.push(...input.fieldRow.map((field) => field.getText()));
			if (input.connection) {
				switch (input.connection.type) {
					case 1: {
						result.push(
							`(${serializeBlock(
								input.connection.targetBlock(),
								selected,
								0,
								true,
							)})`,
						);
						break;
					}
					case 3: {
						result.push(
							`{\n${serializeBlock(
								input.connection.targetBlock(),
								selected,
								indent + 1,
							)}\n${indentValue}}`,
						);
						break;
					}
				}
			}

			return result;
		})
		.join(" ");

	if (selected?.id === block.id)
		value += `${inline ? "" : `\n${indentValue}`}**END_SELECT**`;
	if (block.getNextBlock()) {
		value += `\n${serializeBlock(block.getNextBlock(), selected, indent)}`;
	}

	return value;
}

function pseudo(workspace: Workspace, selected?: Block) {
	const blocks = workspace.getTopBlocks();

	return blocks.map((block) => serializeBlock(block, selected)).join("\n\n");
}

export async function explain(block: Blockly.BlockSvg) {
	const workspace = block.workspace;
	const code = pseudo(workspace, block);

	const locales = {
		en: "English",
		nl: "Dutch",
	};

	const position = block.pathObject.svgPath.getBoundingClientRect();
	await popups.open(
		{
			component: Explanation,
			data: {
				explanation: fetch(`${import.meta.env.VITE_BACKEND_URL}/ai/generate`, {
					method: "post",
					headers: {
						"content-type": "application/json",
					},
					body: JSON.stringify({
						messages: [
							{
								role: "system",
								content: `explain the selected portion of the following pseudo code (SELECT_BEGIN - SELECT_END) in simple terms, the pseudo code is directly generated from a blockly environment to program robots called Leaphy EasyBloqs, you must do this in ${
									locales[get(locale)]
								}`,
							},
							{
								role: "user",
								content: `\`\`\`\n${code}\n\`\`\``,
							},
							{
								role: "system",
								content:
									"please only return the explanation for the given set of code in simple terms, like you're explaining it to someone who has never touched code before, do not explain the code around the given set of code unless directly related, do not talk about or reference the pseudo code directly, you are talking about the selected code almost exclusively, so you do not have to include the **begin_select** and **end_select** tokens in your response, only include your explanation in the response",
							},
						],
						model: "Llama3-70b-8192",
					}),
				}).then(async (res) => {
					if (!res.ok) throw new ErrorPopup(res.statusText);
					return JSON.parse(await res.text());
				}),
			},
			allowInteraction: true,
		},
		{
			position: {
				x: position.x + position.width + 10 - window.innerWidth / 2,
				y: position.y + 10 - window.innerHeight / 2,
			},
			anchor: Anchor.TopLeft,
		},
	);
}

const explainBlockOption: ContextMenuRegistry.RegistryItem = {
	id: "explain_block",
	scopeType: ContextMenuRegistry.ScopeType.BLOCK,
	displayText: () => get(_)("EXPLAIN_BLOCK"),
	weight: -1,
	preconditionFn() {
		return "enabled";
	},
	async callback(scope) {
		await explain(scope.block);
	},
};
ContextMenuRegistry.registry.register(explainBlockOption);
