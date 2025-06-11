<script lang="ts">
import PythonMonitor from "$components/core/popups/popups/PythonMonitor.svelte";
import SerialMonitor from "$components/core/popups/popups/SerialMonitor.svelte";
import Tutorials from "$components/core/popups/popups/Tutorials.svelte";
import SidePanel from "$components/core/sidepanel/SidePanel.svelte";
import ComponentRenderer from "$components/ui/ComponentRenderer.svelte";
import SideBar from "$components/ui/SideBar.svelte";
import SideButton from "$components/ui/SideButton.svelte";
import { RobotType } from "$domain/robots.types";
import PopupState from "$state/popup.svelte";
import WorkspaceState, { Mode } from "$state/workspace.svelte";
import {
	faBook,
	faChalkboardTeacher,
	faCode,
	faSquarePollHorizontal,
} from "@fortawesome/free-solid-svg-icons";
import Code from "./panels/Code.svelte";
import LibraryManager from "./panels/LibraryManager.svelte";

function openSerial() {
	PopupState.open({
		component: SerialMonitor,
		data: {},
		allowInteraction: true,
	});
}

function openPythonTerminal() {
	PopupState.open({
		component: PythonMonitor,
		data: {},
		allowInteraction: true,
	});
}

function openLibraryManager() {
	WorkspaceState.toggleSidePanel(LibraryManager);
}

function openCode() {
	WorkspaceState.toggleSidePanel(Code);
}

function openTutorials() {
	PopupState.open({
		component: Tutorials,
		data: {},
		allowInteraction: true,
	});
}
</script>

<div class="content">
	<ComponentRenderer component={WorkspaceState.Mode} />
    <div class="container">
        <SideBar>
			{#if WorkspaceState.Mode === Mode.BLOCKS}
				<SideButton icon={faCode} action="CODE" onclick={openCode} />
			{/if}
			{#if WorkspaceState.Mode !== Mode.PYTHON}
				{#if WorkspaceState.robot.type === RobotType.L_NANO_RP2040_MICROPYTHON}
					<SideButton icon={faSquarePollHorizontal} action="SERIAL_OUTPUT" onclick={openPythonTerminal} />
				{:else}
					<SideButton icon={faSquarePollHorizontal} action="SERIAL_OUTPUT" onclick={openSerial} />
				{/if}
			{/if}
			{#if WorkspaceState.Mode === Mode.ADVANCED}
				<SideButton icon={faBook} action="LIBRARY_MANAGER" onclick={openLibraryManager} />
			{/if}
			<!-- TODO: add all tutorials first -->
			<!--{#if WorkspaceState.Mode === Mode.BLOCKS}-->
			<!--	<SideButton icon={faChalkboardTeacher} action="TUTORIALS" onclick={openTutorials} />-->
			<!--{/if}-->
		</SideBar>
        {#if WorkspaceState.SidePanel}
            <SidePanel />
        {/if}
    </div>
</div>

<style>
    .container {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        height: 100%;
        z-index: 99;
        pointer-events: none;
    }

    .content {
        position: relative;
        flex: 1;
    }
</style>
