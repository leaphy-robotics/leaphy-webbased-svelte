<script lang="ts">
import SerialMonitor from "$components/core/popups/popups/SerialMonitor.svelte";
import SidePanel from "$components/core/sidepanel/SidePanel.svelte";
import ComponentRenderer from "$components/ui/ComponentRenderer.svelte";
import SideBar from "$components/ui/SideBar.svelte";
import SideButton from "$components/ui/SideButton.svelte";
import PopupState from "$state/popup.svelte";
import WorkspaceState, { Mode } from "$state/workspace.svelte";
import {
	faBook,
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

function openLibraryManager() {
	WorkspaceState.toggleSidePanel(LibraryManager);
}

function openCode() {
	WorkspaceState.toggleSidePanel(Code);
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
				<SideButton icon={faSquarePollHorizontal} action="SERIAL_OUTPUT" onclick={openSerial} />
			{/if}
			{#if WorkspaceState.Mode === Mode.ADVANCED}
				<SideButton icon={faBook} action="LIBRARY_MANAGER" onclick={openLibraryManager} />
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
