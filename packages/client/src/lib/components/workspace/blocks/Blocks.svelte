<script lang="ts">
import Dropper from "$components/ui/Dropper.svelte";
import CodeHints from "$components/workspace/blocks/CodeHints.svelte";
import {
	loadToolbox,
	setLocale,
	setupWorkspace,
} from "$domain/blockly/blockly";
import { dark, light } from "$domain/blockly/theme";
import { RobotType } from "$domain/robots.types";
import AppState, { Theme } from "$state/app.svelte";
import BlocklyState from "$state/blockly.svelte";
import SerialState from "$state/serial.svelte";
import WorkspaceState from "$state/workspace.svelte";
import { arduino, python } from "@leaphy-robotics/leaphy-blocks";
import { Events, serialization } from "blockly";
import { onMount } from "svelte";
import { locale } from "svelte-i18n";

let backgroundX = $state(0);

function getTheme(theme: Theme) {
	return theme === Theme.DARK ? dark : light;
}

function updateSizing() {
	const toolbox = BlocklyState.workspace.getToolbox();
	backgroundX =
		window.innerWidth / 2 +
		(toolbox.getFlyout().isVisible() ? toolbox.getFlyout().getWidth() : 0) / 2 +
		40;
}

function getCodeGenerator(): typeof python | typeof arduino {
	if (WorkspaceState.robot.type === RobotType.L_MICROPYTHON) {
		return python;
	}

	arduino.boardType = SerialState.board?.id || WorkspaceState.robot.board;
	arduino.robotType = WorkspaceState.robot.id;
	return arduino;
}

let element: HTMLDivElement;
onMount(() => {
	BlocklyState.workspace = setupWorkspace(
		WorkspaceState.robot,
		element,
		getTheme(AppState.theme),
		BlocklyState.willRestore ? BlocklyState.restore : undefined,
	);
	updateSizing();

	BlocklyState.workspace.addChangeListener((event) => {
		if (
			"blockId" in event &&
			BlocklyState.workspace
				.getBlockById(event.blockId as string)
				?.type?.includes("procedures")
		) {
			BlocklyState.workspace.getToolbox().refreshSelection();
		}

		BlocklyState.canUndo = BlocklyState.workspace.getUndoStack().length > 0;
		BlocklyState.canRedo = BlocklyState.workspace.getRedoStack().length > 0;

		WorkspaceState.code = getCodeGenerator().workspaceToCode(
			BlocklyState.workspace,
		);

		AppState.libraries.clear();
		AppState.libraries.install(...arduino.getDependencies());

		updateSizing();

		if (event.type === Events.TOOLBOX_ITEM_SELECT) {
			BlocklyState.workspace.resize();
		}
	});

	$effect(() => {
		BlocklyState.workspace.updateToolbox(loadToolbox(WorkspaceState.robot));
		BlocklyState.workspace.getToolbox().selectItemByPosition(1);
		BlocklyState.workspace.getToolbox().refreshTheme();
	});
});

locale.subscribe((locale) => {
	setLocale(WorkspaceState.robot, locale);

	if (BlocklyState.workspace && element) {
		const content = serialization.workspaces.save(BlocklyState.workspace);
		BlocklyState.workspace.dispose();

		BlocklyState.workspace = setupWorkspace(
			WorkspaceState.robot,
			element,
			getTheme(AppState.theme),
			content,
		);
		BlocklyState.workspace.addChangeListener(() => {
			WorkspaceState.code = getCodeGenerator().workspaceToCode(
				BlocklyState.workspace,
			);

			AppState.libraries.clear();
			AppState.libraries.install(...arduino.getDependencies());
		});
	}
});

$effect(() => {
	const theme = getTheme(AppState.theme);

	BlocklyState.workspace?.setTheme(theme);
	BlocklyState.workspace?.refreshTheme();
});
</script>

<div class="relative">
	{#if WorkspaceState.robot.background}
		<img class="absolute w-full max-w-[600px] max-h-[600px] top-1/2 -translate-x-1/2 -translate-y-1/2 -z-[1]" src="{WorkspaceState.robot.background}" alt="{WorkspaceState.robot.name}" style:left={`${backgroundX}px`}>
	{/if}
    <div class="h-[var(--full-height)]" bind:this={element}></div>
	<Dropper />
	<CodeHints />
</div>
