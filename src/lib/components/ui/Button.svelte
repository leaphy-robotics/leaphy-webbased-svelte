<script lang="ts">
import { onDestroy, onMount, setContext, type Snippet } from "svelte";
import ContextMenu from "./ContextMenu.svelte";
import { writable } from "svelte/store";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";

interface Props {
	name?: string;
	icon?: IconDefinition | string;
	onclick?: () => void;
	context?: Snippet;
	mode: "primary" | "secondary" | "outlined" | "accent";
	bold?: boolean;
}
const {
	name,
	mode,
	onclick = onContext,
	context,
	bold,
	icon,
}: Props = $props();

const btn: HTMLButtonElement = $state();

const open = setContext("open", writable(false));
function onContext() {
	if (!context) return;

	open.update(() => true);
}
</script>

{#if $open}
    <ContextMenu source={btn} content={context} />
{/if}

<button
    bind:this={btn}
    {onclick}
    type="button"
    class="btn"
    class:primary={mode === "primary"}
    class:secondary={mode === "secondary"}
    class:outlined={mode === "outlined"}
    class:accent={mode === "accent"}
    class:bold
>
    {#if icon}
        {#if typeof icon === "string"}
            <img class="icon" src={icon} alt="Icon" />
        {:else}
            <Fa {icon} />
        {/if}
    {/if}
    {#if name}{name}{/if}
</button>

<style>
    .btn {
        display: flex;
        gap: 5px;
        align-items: center;
        cursor: pointer;
        border-radius: 20px;
        background: none;
        border: none;
        padding: 10px 15px;
    }

    .icon {
        height: 1em;
    }

    .primary {
        background: var(--primary);
        color: var(--on-primary);
    }
    .secondary {
        background: var(--secondary);
        color: var(--on-secondary);
    }
    .outlined {
        border: 1px solid var(--accent);
        color: var(--on-primary);
    }
    .accent {
        background: var(--accent);
        color: var(--on-accent);
    }
    .bold {
        font-weight: bolder;
        font-size: 1.1em;
    }
</style>
