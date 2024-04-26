<script lang="ts">
    import { onMount } from "svelte";
    import { setupWorkspace } from "$domain/blockly/blockly";
    import workspaceState, { sidePanel } from "$state/workspace.svelte";
    import { popups } from "$state/popup.svelte";
    import { arduino } from "@leaphy-robotics/leaphy-blocks";
    import SideButton from "$components/ui/SideButton.svelte";
    import { faCode, faSquarePollHorizontal } from "@fortawesome/free-solid-svg-icons";
    import SideBar from "$components/ui/SideBar.svelte";
    import SerialMonitor from "$components/core/popups/popups/SerialMonitor.svelte";
    import Code from "../panels/Code.svelte";
    import { workspace } from "$state/blockly.svelte"

    let element: HTMLDivElement;
    onMount(() => {
      workspace.update(() => setupWorkspace(workspaceState.robot, element))
      $workspace.addChangeListener(() => {
        workspaceState.code = arduino.workspaceToCode($workspace)
      })
    });

    function openSerial() {
        popups.open({
            component: SerialMonitor,
            data: {},
            allowInteraction: true
        })
    }

    function openCode() {
        if ($sidePanel === Code) sidePanel.update(() => undefined)
        else sidePanel.update(() => Code)
    }
</script>

{#snippet actions()}
    <SideButton icon={faCode} onclick={openCode} />
    <SideButton icon={faSquarePollHorizontal} onclick={openSerial} />
{/snippet}

<div class="environment">
    <div class="blockly" bind:this={element} />
    <SideBar buttons={actions} />
</div>

<style>
    .blockly {
        height: var(--full-height);
    }

    .environment {
        position: relative;
    }
</style>
