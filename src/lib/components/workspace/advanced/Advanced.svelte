<script lang="ts">
    import CodeEditor from "$components/ui/CodeEditor.svelte";
    import SideBar from "$components/ui/SideBar.svelte";
    import SideButton from "$components/ui/SideButton.svelte";
    import { code, sidePanel } from "$state/workspace.svelte";
    import { faCode, faSquarePollHorizontal } from "@fortawesome/free-solid-svg-icons";
    import Code from "../panels/Code.svelte";
    import { popups } from "$state/popup.svelte";
    import SerialMonitor from "$components/core/popups/popups/SerialMonitor.svelte";

    function openSerial() {
        popups.open({
            component: SerialMonitor,
            data: {},
            allowInteraction: true
        })
    }
</script>

{#snippet actions()}
    <SideButton icon={faSquarePollHorizontal} onclick={openSerial} />
{/snippet}

<div class="environment">
    <CodeEditor bind:value={$code} />
    <SideBar buttons={actions} />
</div>

<style>
    .environment {
        height: var(--full-height);
        position: relative;
    }
</style>
