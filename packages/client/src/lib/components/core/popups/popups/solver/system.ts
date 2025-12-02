import BlocklyState from "$state/blockly.svelte";
import WorkspaceState from "$state/workspace.svelte";
import { pseudo } from "$domain/blockly/pseudo";
import { RobotType } from "$domain/robots.types";
import { getBlocksMessage } from "./blocks";
import { locale } from "svelte-i18n";
import { get } from "svelte/store";

function getUserLevel() {
    switch (WorkspaceState.robot.type) {
        case RobotType.L_FLITZ_UNO:
        case RobotType.L_FLITZ_NANO:
            return "beginner"
        case RobotType.L_STARLING:
        case RobotType.L_ORIGINAL:
            return "intermediate"
        case RobotType.L_NANO:
        case RobotType.L_NANO_ESP32:
        case RobotType.L_NANO_RP2040:
            return "advanced"
    }

    return "unknown"
}

export function getHelpRequest() {
    return `
The user has indicated that they want to communicate in ${get(locale) === "en" ? "English" : "Dutch"}. Please only respond and ask questions in this language.
user_level: ${getUserLevel()}\n
workspace_pseudocode:\n ${pseudo(BlocklyState.workspace)}\n
available_blocks\n: ${getBlocksMessage()}
    `
}
