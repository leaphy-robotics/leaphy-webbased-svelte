<script lang="ts">
import { _ } from "svelte-i18n";

import AppState, { type Library } from "$state/app.svelte";
import Button from "./Button.svelte";
import Select from "./Select.svelte";

interface Props {
	library: Library;
}
const { library }: Props = $props();

let version = $state(library.versions[0]);
const isInstalled = $derived(
	!!AppState.libraries.installed.find(([name]) => name === library.name),
);

function interact() {
	if (isInstalled)
		return (AppState.libraries.installed = AppState.libraries.installed.filter(
			([name]) => name !== library.name,
		));

	AppState.libraries.installed.push([library.name, version]);
}
</script>

<div class="flex flex-col gap-2">
    <div>
        <span class="font-bold">{library.name}</span>
        <span> {$_("ATTRIBUTION")} {library.author}</span>
    </div>
    <div class="whitespace-pre-line">{library.paragraph}</div>
    <div class="flex gap-2.5">
        {#if !isInstalled}
            <Select options={library.versions.map((e) => [e, e])} bind:value={version} />
        {/if}
        <Button mode={"primary"} name={$_(isInstalled ? "UNINSTALL_LIBRARY" : "INSTALL_LIBRARY")} onclick={interact} />
    </div>
</div>
