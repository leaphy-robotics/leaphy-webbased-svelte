<script lang="ts">
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { type Snippet, onDestroy, onMount, setContext } from "svelte";
import Fa from "svelte-fa";
import { type Writable, writable } from "svelte/store";
import ContextMenu from "./ContextMenu.svelte";

interface Props {
	name?: string;
	icon?: IconDefinition | string;
	onclick?: () => void;
	context?: Snippet<[Writable<boolean>]>;
	disabled?: boolean;
	mode: "primary" | "secondary" | "outlined" | "accent";
	bold?: boolean;
	type?: "button" | "submit";
	inline?: boolean;
}

const {
	name,
	mode,
	onclick = onContext,
	context,
	bold,
	icon,
	disabled,
	inline=false,
	type = "button",
}: Props = $props();

let btn: HTMLButtonElement = $state();

const open = writable(false);

function onContext() {
	if (!context) return;

	open.set(true);
}
</script>

{#if $open}
	<ContextMenu {open} source={btn} content={context}/>
{/if}

<button
	bind:this={btn}
	{onclick}
	{disabled}
	{type}
	class="btn"
	class:primary={mode === "primary"}
	class:secondary={mode === "secondary"}
	class:outlined={mode === "outlined"}
	class:accent={mode === "accent"}
	class:bold
	class:inline
>
	{#if icon}
		{#if typeof icon === "string"}
			<img class="icon" src={icon} alt="Icon"/>
		{:else}
			<Fa {icon}/>
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

	.inline {
		padding: 5px 10px;
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

	.btn[disabled] {
		filter: opacity(.5);
		cursor: unset;
	}
</style>
