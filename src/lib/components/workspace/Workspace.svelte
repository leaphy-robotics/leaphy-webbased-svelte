<script lang="ts">
    import SerialMonitor from "$components/core/popups/popups/SerialMonitor.svelte";
    import SidePanel from "$components/core/sidepanel/SidePanel.svelte";
    import SideButton from "$components/ui/SideButton.svelte";
    import { popups } from "$state/popup.svelte";
    import { sidePanel, mode, Mode } from "$state/workspace.svelte";
    import {
        faBook,
        faCode,
        faSquarePollHorizontal,
    } from "@fortawesome/free-solid-svg-icons";
    import LibraryManager from "./panels/LibraryManager.svelte";
    import Code from "./panels/Code.svelte";
    import SideBar from "$components/ui/SideBar.svelte";

    function openSerial() {
        popups.open({
            component: SerialMonitor,
            data: {},
            allowInteraction: true,
        });
    }

    function openLibraryManager() {
        if ($sidePanel === LibraryManager) sidePanel.set(undefined);
        else sidePanel.set(LibraryManager);
    }

    function openCode() {
        if ($sidePanel === Code) sidePanel.set(undefined);
        else sidePanel.set(Code);
    }
</script>

{#snippet actions()}
    {#if $mode === Mode.BLOCKS}
        <SideButton icon={faCode} onclick={openCode} />
    {/if}
    {#if $mode !== Mode.PYTHON}
        <SideButton icon={faSquarePollHorizontal} onclick={openSerial} />
    {/if}
    {#if $mode === Mode.ADVANCED}
        <SideButton icon={faBook} onclick={openLibraryManager} />
    {/if}
{/snippet}

<div class="content">
    <svelte:component this={$mode} />
    <div class="container">
        <SideBar buttons={actions} />
        {#if $sidePanel}
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
    }

    .content {
        position: relative;
        flex: 1;
    }
</style>
