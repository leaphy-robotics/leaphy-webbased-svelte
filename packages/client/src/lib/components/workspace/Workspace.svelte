<script lang="ts">
import Circuit from "$components/core/popups/popups/Circuit.svelte";
import PythonMonitor from "$components/core/popups/popups/PythonMonitor.svelte";
import SerialMonitor from "$components/core/popups/popups/SerialMonitor.svelte";
import Tutorials from "$components/core/popups/popups/tutorials/Tutorials.svelte";
import Solver from "$components/core/popups/popups/solver/Solver.svelte";
import SidePanel from "$components/core/sidepanel/SidePanel.svelte";
import ComponentRenderer from "$components/ui/ComponentRenderer.svelte";
import SideBar from "$components/ui/SideBar.svelte";
import SideButton from "$components/ui/SideButton.svelte";
import { inFilter } from "$domain/robots";
import robotsGroups from "$domain/robots.groups";
import { RobotType } from "$domain/robots.types";
import PopupState from "$state/popup.svelte";
import WorkspaceState, { Mode } from "$state/workspace.svelte";
import {
	faBook,
	faCode,
	faLightbulb,
	faSquarePollHorizontal,
} from "@fortawesome/free-solid-svg-icons";
import Code from "./panels/Code.svelte";
import LibraryManager from "./panels/LibraryManager.svelte";
import Dashboard from "$components/core/popups/popups/help/Dashboard.svelte";

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

function openDashboard() {
	PopupState.open({
		component: Dashboard,
		data: {},
		allowInteraction: true,
	});
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
				<SideButton icon={faSquarePollHorizontal} action="SERIAL_OUTPUT" onclick={WorkspaceState.robot.type === RobotType.L_MICROPYTHON ? openPythonTerminal : openSerial} />
			{/if}
			{#if WorkspaceState.Mode === Mode.ADVANCED}
				<SideButton icon={faBook} action="LIBRARY_MANAGER" onclick={openLibraryManager} />
			{/if}
			{#if WorkspaceState.Mode === Mode.BLOCKS && inFilter(WorkspaceState.robot, [RobotType.L_STARLING])}
				<SideButton icon={faLightbulb} action="HELP_TOOLS" onclick={openDashboard} />
			{/if}
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
