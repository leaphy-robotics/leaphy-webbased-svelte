<script lang="ts">
import { setLocale, setupWorkspace } from "$domain/blockly/blockly";
import { dark, light } from "$domain/blockly/theme";
import { Theme, theme } from "$state/app.svelte";
import { restore, willRestore, workspace } from "$state/blockly.svelte";
import { code, robot } from "$state/workspace.svelte";
import { arduino } from "@leaphy-robotics/leaphy-blocks";
import { WorkspaceSvg, serialization } from "blockly";
import { onMount } from "svelte";
import { locale } from "svelte-i18n";
import { get } from "svelte/store";

let backgroundX = $state(0);

function getTheme(theme: Theme) {
	return theme === Theme.DARK ? dark : light;
}

function updateSizing() {
	const toolbox = ($workspace as WorkspaceSvg).getToolbox();
	backgroundX =
		window.innerWidth / 2 +
		(toolbox.getFlyout().isVisible() ? toolbox.getFlyout().getWidth() : 0) / 2 +
		40;
}

let element: HTMLDivElement;
onMount(() => {
	workspace.set(
		setupWorkspace(
			$robot,
			element,
			getTheme($theme),
			get(willRestore) ? get(restore) : undefined,
		),
	);
	updateSizing();
	$workspace.addChangeListener((event: any) => {
		if (!(event.type === "toolbox_item_select")) {
			return;
		}
		code.set(arduino.workspaceToCode($workspace));
		updateSizing();
		($workspace as WorkspaceSvg).resize();
	});
});

locale.subscribe((locale) => {
	setLocale($robot, locale);

	if ($workspace && element) {
		const content = serialization.workspaces.save($workspace);
		$workspace.dispose();

		workspace.update(() =>
			setupWorkspace($robot, element, getTheme($theme), content),
		);
		$workspace.addChangeListener(() => {
			code.set(arduino.workspaceToCode($workspace));
		});
	}
});

theme.subscribe((theme) => {
	if (!$workspace || !($workspace instanceof WorkspaceSvg)) return;

	$workspace.setTheme(getTheme(theme));
	$workspace.refreshTheme();
});
</script>

<div class="environment">
	{#if $robot.background}
		<img class="background" src="{$robot.background}" alt="{$robot.name}" style:left={`${backgroundX}px`}>
	{/if}
    <div class="blockly" bind:this={element}></div>
</div>

<style>
    .blockly {
        height: var(--full-height);
    }

    .environment {
        position: relative;
    }

	.background {
		position: absolute;
		width: 100%;
		max-width: 600px;
		max-height: 600px;
		top: 50%;
		translate: -50% -50%;
		z-index: -1;
	}
</style>
