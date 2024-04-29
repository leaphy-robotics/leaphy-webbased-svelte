import * as Blockly from "blockly";
import "@blockly/field-bitmap";
import {
  blocks,
  CATEGORIES,
  EXTENSIONS,
  THEME,
  translations,
} from "@leaphy-robotics/leaphy-blocks";
import PinSelectorField from "./fields";
import { LeaphyCategory } from "./category-ui/category";
import { LeaphyToolbox } from "./category-ui/toolbox";
import { type RobotDevice } from "$domain/robots";
import { RobotType } from "$domain/robots.types";
import toolbox from "./toolbox";
import type {
  CategoryInfo,
  ToolboxDefinition,
  ToolboxItemInfo,
} from "blockly/core/utils/toolbox";

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

function shouldShow(robot: RobotDevice, filter: number[]) {
  if (filter.includes(-robot.type)) return false;

  return filter.includes(robot.type);
}

function loadToolbox(robot: RobotDevice): ToolboxDefinition {
  return {
    kind: "categoryToolbox",
    contents: toolbox
      .filter(({ robots }) => (robots ? shouldShow(robot, robots) : true))
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
            .filter(({ robots }) => (robots ? shouldShow(robot, robots) : true))
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
  Blockly.setLocale(translation)
  if (robot.type === RobotType.L_FLITZ_NANO) {
    translation.ARD_SERVO_WRITE = translation.ARD_SERVO_ARM_WRITE;
  } else {
    translation.ARD_SERVO_WRITE = translation.ARD_SERVO_REGULAR_WRITE;
  }
}

export function setupWorkspace(robot: RobotDevice, element: HTMLDivElement, content?: { [key: string]: any }) {
  PinSelectorField.processPinMappings(robot)

  const workspace = Blockly.inject(element, {
    renderer: "zelos",
    toolbox: loadToolbox(robot),
    theme: Blockly.Theme.defineTheme("leaphy", {
      name: "leaphy",
      blockStyles: THEME.defaultBlockStyles,
      categoryStyles: THEME.categoryStyles,
      componentStyles: THEME.componentStyles,
    }),
    zoom: {
      startScale: .8
    }
  });

  Blockly.serialization.workspaces.load(content || {
      blocks: {
          languageVersion: 0,
          blocks: [
              {
                  type: "leaphy_start",
                  id: "rzE0Ve:6bHB~8aIqyj-U",
                  deletable: false,
                  x: 500,
                  y: 10
              }
          ]
      }
  }, workspace)

  const toolbox = workspace.getToolbox();
  workspace.registerToolboxCategoryCallback("LISTS", CATEGORIES.LISTS);
  toolbox.getFlyout().autoClose = false;
  toolbox.selectItemByPosition(0)
  toolbox.refreshTheme();

  return workspace
}
