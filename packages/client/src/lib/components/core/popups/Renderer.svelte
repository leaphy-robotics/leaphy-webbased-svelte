<script lang="ts">
import Explanation from "$components/core/popups/popups/Explanation.svelte";
import AIState from "$state/ai.svelte";
import PopupState from "$state/popup.svelte";
import RecordingsState from "$state/recordings.svelte";
import { onMount } from "svelte";
import Popup from "./Popup.svelte";

onMount(async () => {
	await PopupState.setup();
	await RecordingsState.setup();
});
</script>

<div class="popupRoot">
    {#each PopupState.popups as state (state.id)}
        <Popup {state} />
    {/each}

	{#if AIState.visible}
		<Explanation />
	{/if}
</div>

<style>
    .popupRoot {
        position: fixed;
        top: 50%;
        left: 50%;
        z-index: 99999;
    }
</style>
