<script lang="ts">
    import { popups, setup } from "$state/popup.svelte";
    import { onMount } from "svelte";
    import Popup from "./Popup.svelte";

    onMount(async () => {
        await setup()
    })
</script>

<div class="popupRoot">
    {#each $popups as state (state.id)}
        <Popup state={state} />
    {/each}
</div>

<style>
    .popupRoot {
        position: fixed;
        top: 50%;
        left: 50%;
        z-index: 99999;
    }
</style>
