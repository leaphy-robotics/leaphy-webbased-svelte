<script lang="ts">
import { onMount } from "svelte";
import { setLocale, setupWorkspace } from "$domain/blockly/blockly";
import { sidePanel, robot, code } from "$state/workspace.svelte";
import { popups } from "$state/popup.svelte";
import { arduino } from "@leaphy-robotics/leaphy-blocks";
import SideButton from "$components/ui/SideButton.svelte";
import {
	faCode,
	faSquarePollHorizontal,
} from "@fortawesome/free-solid-svg-icons";
import SideBar from "$components/ui/SideBar.svelte";
import SerialMonitor from "$components/core/popups/popups/SerialMonitor.svelte";
import Code from "../panels/Code.svelte";
import { workspace } from "$state/blockly.svelte";
import { locale } from "svelte-i18n";
import { WorkspaceSvg, serialization } from "blockly";
import { Theme, theme } from "$state/app.svelte";
import { dark, light } from "$domain/blockly/theme";

function getTheme(theme: Theme) {
	return theme === Theme.DARK ? dark : light;
}

let element: HTMLDivElement;
onMount(() => {
	workspace.update(() => setupWorkspace($robot, element, getTheme($theme)));
	$workspace.addChangeListener(() => {
		code.set(arduino.workspaceToCode($workspace));
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
    <div class="blockly" bind:this={element}></div>
</div>

<style>
    .blockly {
        height: var(--full-height);
    }

    .environment {
        position: relative;
    }
</style>
