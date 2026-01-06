import type { Workspace, utils } from "blockly";
import * as Blockly from "blockly";
import { ContextMenuRegistry, type WorkspaceSvg, serialization } from "blockly";
import "@blockly/field-bitmap";
import defaultProgram from "$assets/default-program.json?raw";
import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Prompt from "$components/core/popups/popups/Prompt.svelte";
import Warning from "$components/core/popups/popups/Warning.svelte";
import { PseudoSerializer, explainBlockOption } from "$domain/blockly/pseudo";
import { type RobotDevice, inFilter } from "$domain/robots";
import { RobotType } from "$domain/robots.types";
import BlocklyState from "$state/blockly.svelte";
import PopupState from "$state/popup.svelte";
import { BackpackChange } from "@blockly/workspace-backpack";
import {
	CATEGORIES,
	blocks,
	registerExtensions,
	translations,
} from "@leaphy-robotics/leaphy-blocks";
import { Backpack } from "./backpack";
import { LeaphyCategory } from "./category-ui/category";
import PinSelectorField from "./fields";
import toolbox from "./toolbox";
import "@blockly/toolbox-search";
import bluetooth from "$domain/blockly/bluetooth";
import LeaphyToolbox from "$domain/blockly/category-ui/toolbox.svelte";
import WorkspaceState from "$state/workspace.svelte";
import type { BlockDefinition } from "blockly/core/blocks";
import { _ as translate } from "svelte-i18n";
import { get } from "svelte/store";
import Extensions from "./extensions.svelte";

Blockly.defineBlocksWithJsonArray(blocks);
Blockly.fieldRegistry.register("field_pin_selector", PinSelectorField);
Blockly.registry.register(
	Blockly.registry.Type.TOOLBOX_ITEM,
	Blockly.ToolboxCategory.registrationName,
	LeaphyCategory,
	true,
);
Blockly.registry.register(
	Blockly.registry.Type.SERIALIZER,
	"extensions",
	Extensions,
);
Blockly.registry.register(
	Blockly.registry.Type.SERIALIZER,
	"lists",
	new CATEGORIES.ListSerializer(),
);
Blockly.registry.register(
	Blockly.registry.Type.SERIALIZER,
	"mesh",
	new CATEGORIES.MeshSignalSerializer(),
);
Blockly.registry.register(
	Blockly.registry.Type.SERIALIZER,
	"ml",
	new CATEGORIES.MLSerializer(),
);
Blockly.registry.register(
	Blockly.registry.Type.SERIALIZER,
	"pseudo",
	new PseudoSerializer(),
);

registerExtensions(Blockly);

Blockly.dialog.setConfirm(async (title, callback) => {
	const confirmed = await PopupState.open({
		component: Warning,
		data: {
			title,
			showCancel: true,
		},
		allowInteraction: false,
	});
	callback(confirmed as boolean);
});

Blockly.dialog.setPrompt(async (title, defaultValue, callback) => {
	const name = await PopupState.open({
		component: Prompt,
		data: {
			name: title,
			placeholder: title,
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

export function getAllBlocks() {
	const contents = toolbox
		.filter((category) => category.id !== "l_search")
		.filter(({ robots }) =>
			robots ? inFilter(WorkspaceState.robot, robots) : true,
		)
		.filter((category) => Extensions.isEnabled(category.id))
		.flatMap((category) => {
			if (category.custom) {
				const callback = BlocklyState.workspace.getToolboxCategoryCallback(
					category.custom,
				);
				if (!callback) return;

				return callback(
					BlocklyState.workspace,
				) as utils.toolbox.FlyoutItemInfoArray;
			}
			if (!category.groups) return;
			return category.groups.flatMap((group) =>
				group.blocks.map((block) => ({
					kind: "block",
					...block,
				})),
			);
		})
		.filter((block) => block.kind === "block" && "type" in block);

	// Add blocks to a map to avoid duplicates
	const blocks = new Map<string, BlockDefinition>();
	for (const block of contents) {
		blocks.set(block.type, block);
	}

	return Array.from(blocks.values());
}

export function loadToolbox(
	robot: RobotDevice,
	dynamicCategories = false,
): utils.toolbox.ToolboxInfo {
	const contents = toolbox
		.filter(({ robots }) => (robots ? inFilter(robot, robots) : true))
		.map((category) => {
			const result: Record<string, any> = {
				kind: "category",
				toolboxitemid: category.id.replace("%robot%", robot.id),
				name: category.name,
				categorystyle: category.style,
			};

			if (category.custom) result.custom = category.custom;
			if (!category.groups) return result as utils.toolbox.CategoryInfo;

			result.custom = category.id;
			return result as utils.toolbox.CategoryInfo;
		});

	return {
		kind: "categoryToolbox",
		contents,
	};
}

function getCategoryContents(robot: RobotDevice, category: any) {
	return;
}

function registerDynamicCategories(
	robot: RobotDevice,
	workspace: WorkspaceSvg,
) {
	for (const category of toolbox) {
		if (!category.groups) continue;

		const expanded = new Set<number>();
		for (let i = 0; i < category.groups.length; i++) {
			const group = category.groups[i];

			if (!("defaultExpanded" in group)) {
				expanded.add(i);
				continue;
			}
			if (group.defaultExpanded) {
				expanded.add(i);
			}
		}

		workspace.registerToolboxCategoryCallback(category.id, () => {
			return category.groups.flatMap((group, i) => {
				const contents = [];

				if ("label" in group) {
					contents.push({
						kind: "label",
						text: (expanded.has(i) ? "▼ " : "► ") + get(translate)(group.label),
						"web-class": `category-${category.id}-group-${i}`,
					});
					if (expanded.has(i)) {
						contents.push({ kind: "sep", gap: "8" });
					}
				}
				if (expanded.has(i)) {
					contents.push(
						...group.blocks
							.filter(({ robots }) => (robots ? inFilter(robot, robots) : true))
							.flatMap((item) => {
								return [
									{ kind: "sep", gap: "8" },
									{ kind: "block", ...item },
								];
							})
							.slice(1),
					);
				}

				return contents;
			});
		});

		let removeController: AbortController;
		function registerListeners() {
			removeController?.abort();
			removeController = new AbortController();

			category.groups.forEach((group, i) => {
				if (!("label" in group)) return;

				const label = document.querySelector(
					`.category-${category.id}-group-${i}`,
				);
				if (!label) return;

				label.addEventListener(
					"click",
					() => {
						if (expanded.has(i)) {
							expanded.delete(i);
						} else {
							expanded.add(i);
						}
						workspace.refreshToolboxSelection();
						registerListeners();
					},
					{ signal: removeController.signal },
				);
			});
		}

		workspace.addChangeListener((event: Blockly.Events.Abstract) => {
			if (event.type !== "toolbox_item_select") return;
			registerListeners();
		});
	}
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
		plugins: {
			toolbox: LeaphyToolbox,
		},
	});
	Blockly.serialization.workspaces.load(
		content || JSON.parse(defaultProgram),
		workspace,
	);

	const toolbox = workspace.getToolbox();
	registerDynamicCategories(robot, workspace);
	workspace.registerToolboxCategoryCallback("LISTS", CATEGORIES.LISTS);
	workspace.registerToolboxCategoryCallback("MESH", CATEGORIES.MESH);
	workspace.registerToolboxCategoryCallback("ML", CATEGORIES.ML);
	workspace.registerToolboxCategoryCallback("SEARCH", CATEGORIES.SEARCH);
	workspace.registerToolboxCategoryCallback("BLE", bluetooth);
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
