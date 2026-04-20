<script lang="ts">
import PythonMonitor from "$components/core/popups/popups/PythonMonitor.svelte";
import SerialMonitor from "$components/core/popups/popups/SerialMonitor.svelte";
import Debugger from "$components/core/popups/popups/debugger/Debugger.svelte";
import Dashboard from "$components/core/popups/popups/help/Dashboard.svelte";
import Tutorials from "$components/core/popups/popups/tutorials/Tutorials.svelte";
import EmbedSidePanel from "$components/core/sidepanel/EmbedSidePanel.svelte";
import SidePanel from "$components/core/sidepanel/SidePanel.svelte";
import ComponentRenderer from "$components/ui/ComponentRenderer.svelte";
import SideBar from "$components/ui/SideBar.svelte";
import SideButton from "$components/ui/SideButton.svelte";
import { inFilter } from "$domain/robots";
import robotsGroups from "$domain/robots.groups";
import { RobotType } from "$domain/robots.types";
import EmbedSvelte from "$state/embed.svelte";
import PopupState from "$state/popup.svelte";
import WorkspaceState, { Mode } from "$state/workspace.svelte";
import {
	faBook,
	faBug,
	faChalkboardTeacher,
	faCode,
	faLightbulb,
	faSquarePollHorizontal,
	faTasks,
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
		allowOverflow: true,
		position: {
			x: window.innerWidth / 2 - 320,
			y: window.innerHeight / 2 - 210,
		},
	});
}

function openAssignment() {
	WorkspaceState.toggleSidePanel(EmbedSidePanel);
}
</script>

<div class="relative flex-1">
	<ComponentRenderer component={WorkspaceState.Mode} />
	<div class="absolute top-0 right-0 flex h-full z-[99] pointer-events-none">
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
			{#if WorkspaceState.Mode === Mode.BLOCKS && inFilter(WorkspaceState.robot, [RobotType.L_STARLING, RobotType.L_NANO])}
				<SideButton icon={faLightbulb} action="HELP_TOOLS" onclick={openDashboard} />
			{/if}
			{#if WorkspaceState.Mode === Mode.BLOCKS && inFilter(WorkspaceState.robot, [...robotsGroups.ALL, -RobotType.L_STARLING, -RobotType.L_NANO])}
				<SideButton icon={faChalkboardTeacher} action="TUTORIALS" onclick={openTutorials} />
			{/if}
			{#if EmbedSvelte.sidebar}
				<SideButton icon={faTasks} action="ASSIGNMENT" onclick={openAssignment} />
			{/if}
		</SideBar>
		{#if WorkspaceState.SidePanel}
			<SidePanel />
		{/if}
	</div>
</div>
