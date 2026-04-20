<script lang="ts">
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import Library from "$components/ui/Library.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import AppState from "$state/app.svelte";

let filter = $state("");
onMount(() => {
	AppState.libraries.query();
});

const visible = $derived(
	AppState.libraries.libraries
		.filter(({ name }) => name.toUpperCase().includes(filter.toUpperCase()))
		.slice(0, 100),
);
</script>

<div class="flex flex-col gap-2.5 bg-bg-tint w-full p-2.5">
    <TextInput mode={"primary"} rounded={true} placeholder={$_("SEARCH_PLACEHOLDER")} bind:value={filter} />
    <div class="flex flex-col overflow-y-auto gap-2.5">
        {#each visible as library (library.name)}
            <Library {library} />
        {/each}
    </div>
</div>
