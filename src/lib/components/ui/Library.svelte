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

<div class="library">
    <div class="library-header">
        <div class="name">{library.name}</div>
        <div class="attribution">{$_("ATTRIBUTION")} {library.author}</div>
    </div>
    <div class="description">{library.paragraph}</div>
    <div class="installer">
        {#if !isInstalled}<Select
                options={library.versions.map((e) => [e, e])}
                bind:value={version}
            />{/if}
        <Button
            mode={"primary"}
            name={$_(isInstalled ? "UNINSTALL_LIBRARY" : "INSTALL_LIBRARY")}
            onclick={interact}
        />
    </div>
</div>

<style>
    .name {
        display: inline-block;
        font-weight: bold;
    }
    .attribution {
        display: inline-block;
    }

    .description {
        white-space: pre-line;
    }

    .installer {
        display: flex;
        gap: 10px;
    }
</style>
