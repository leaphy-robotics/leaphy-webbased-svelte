<script lang="ts">
    import SerialMonitor from "$components/core/popups/popups/SerialMonitor.svelte";
    import TerminalPopup from "$components/core/popups/popups/TerminalPopup.svelte"; // Importeer het terminal component
    import SidePanel from "$components/core/sidepanel/SidePanel.svelte";
    import SideBar from "$components/ui/SideBar.svelte";
    import SideButton from "$components/ui/SideButton.svelte";
    import { popups } from "$state/popup.svelte";
    import { Mode, mode, sidePanel } from "$state/workspace.svelte";
    import {
      faBook,
      faCode,
      faSquarePollHorizontal,
      faTerminal
    } from "@fortawesome/free-solid-svg-icons";
    import Code from "./panels/Code.svelte";
    import LibraryManager from "./panels/LibraryManager.svelte";
  
    // Reactive variabele voor de zichtbaarheid van de terminal-popup
    let showTerminal: boolean = false;
  
    function toggleTerminal() {
      showTerminal = !showTerminal;
    }
  
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
  
  <!-- Zijbalk met knoppen -->
  {#snippet actions()}
    {#if $mode === Mode.BLOCKS || $mode === Mode.PYTHONBLOCKS}
      <SideButton icon={faCode} action="CODE" onclick={openCode} />
    {/if}
    {#if $mode !== Mode.PYTHON && $mode !== Mode.PYTHONBLOCKS}
      <SideButton icon={faSquarePollHorizontal} action="SERIAL_OUTPUT" onclick={openSerial} />
    {/if}
    {#if $mode === Mode.ADVANCED}
      <SideButton icon={faBook} action="LIBRARY_MANAGER" onclick={openLibraryManager} />
    {/if}
    {#if $mode === Mode.PYTHONBLOCKS}
      <!-- Terminal knop: toggle de TerminalPopup -->
      <SideButton icon={faTerminal} action="TERMINAL" onclick={toggleTerminal} />
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
  
  <!-- Toon de TerminalPopup als showTerminal true is. We vangen het "close" event op -->
  {#if showTerminal}
    <TerminalPopup on:close={() => showTerminal = false} />
  {/if}
  
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
  