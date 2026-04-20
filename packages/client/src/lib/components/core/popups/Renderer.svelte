<script lang="ts">
import Explanation from "$components/core/popups/popups/Explanation.svelte";
import AIState from "$state/ai.svelte";
import EmbedState from "$state/embed.svelte";
import PopupState from "$state/popup.svelte";
import RecordingsState from "$state/recordings.svelte";
import { onMount } from "svelte";
import Popup from "./Popup.svelte";

onMount(async () => {
	EmbedState.setupEmbedApi();
	await PopupState.setup();
	await RecordingsState.setup();
});
</script>

<div class="fixed top-1/2 left-1/2 z-[99999]">
	{#each PopupState.popups as state (state.id)}
		<Popup {state} />
	{/each}

	{#if AIState.visible}
		<Explanation />
	{/if}
</div>
