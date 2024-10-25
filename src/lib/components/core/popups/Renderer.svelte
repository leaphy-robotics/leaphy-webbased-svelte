<script lang="ts">
import PopupState from "$state/popup.svelte";
import { onMount } from "svelte";
import Popup from "./Popup.svelte";

onMount(async () => {
	await PopupState.setup()
});
</script>

<div class="popupRoot">
    {#each PopupState.popups as state (state.id)}
        <Popup {state} />
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
