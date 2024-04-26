<script lang="ts">
    import { popups } from "$state/popup.svelte";
    import Popup from "./Popup.svelte";
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
