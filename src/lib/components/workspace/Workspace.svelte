<script lang="ts">
    import SidePanel from "$components/core/sidepanel/SidePanel.svelte";
    import { sidePanel, mode } from "$state/workspace.svelte";
</script>

<div class="container">
    <div class="content">
        <svelte:component this="{$mode}" />
    </div>
    {#if $sidePanel}
        <SidePanel />
    {/if}
</div>

<style>
    .container {
        display: flex;
        height: 100%;
        width: 100%;
    }

    .content {
        flex: 1;
    }
</style>
