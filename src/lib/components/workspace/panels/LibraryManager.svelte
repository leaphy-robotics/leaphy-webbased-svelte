<script lang="ts">
import { _ } from "svelte-i18n";

import Library from "$components/ui/Library.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import { libraries } from "$state/app.svelte";
import { onMount } from "svelte";

let filter = $state("");
onMount(() => {
	libraries.query();
});

const visible = $derived(
	$libraries
		.filter(({ name }) => name.toUpperCase().includes(filter.toUpperCase()))
		.slice(0, 100),
);
</script>

<div class="content">
    <div class="header">
        <TextInput
            mode={"primary"}
            rounded={true}
            placeholder={$_("SEARCH_PLACEHOLDER")}
            bind:value={filter}
        />
    </div>
    <div class="libraries">
        {#each visible as library (library.name)}
            <Library {library} />
        {/each}
    </div>
</div>

<style>
    .content {
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: var(--background-tint);
        color: var(--on-background-tint);
        width: 100%;
        padding: 10px;
    }

    .libraries {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        gap: 10px;
    }
</style>
