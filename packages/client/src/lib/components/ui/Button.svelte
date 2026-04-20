<script lang="ts">
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import type { Snippet } from "svelte";
import { type Writable, writable } from "svelte/store";
import Fa from "svelte-fa";
import ContextMenu from "./ContextMenu.svelte";

interface Props {
	name?: string;
	icon?: IconDefinition | string;
	onclick?: () => void;
	context?: Snippet<[Writable<boolean>]>;
	disabled?: boolean;
	mode: "primary" | "secondary" | "outlined" | "accent" | "tint";
	bold?: boolean;
	type?: "button" | "submit";
	inline?: boolean;
	center?: boolean;
	large?: boolean;
	iconAlign?: "left" | "right";
}

const {
	name,
	mode,
	onclick = onContext,
	context,
	bold,
	icon,
	disabled,
	inline = false,
	type = "button",
	center = false,
	large = false,
	iconAlign = "left",
}: Props = $props();

let btn: HTMLButtonElement = $state();

const open = writable(false);

function onContext() {
	if (!context) return;
	open.set(true);
}

const modeClasses = {
	primary: "bg-primary text-on-primary border-none",
	secondary: "bg-secondary text-on-secondary border-none",
	outlined: "bg-transparent border border-accent text-on-primary",
	accent: "bg-accent text-on-accent border-none",
	tint: "bg-bg-tint text-on-bg border-none",
};
</script>

{#if $open}
	<ContextMenu {open} source={btn} content={context}/>
{/if}

<button
	bind:this={btn}
	{onclick}
	{disabled}
	{type}
	class="inline-flex items-center gap-1.5 cursor-pointer rounded-full text-sm
		{modeClasses[mode]}
		{inline ? 'h-7 px-2.5' : 'h-9 px-4'}
		{center ? 'justify-center' : ''}
		{bold ? 'font-bold text-base!' : ''}
		{large ? 'text-base!' : ''}
		disabled:opacity-50 disabled:cursor-default transition-opacity"
>
	{#if iconAlign === "left"}
		{#if icon}
			{#if typeof icon === "string"}
				<img class="h-[1em]" src={icon} alt="Icon"/>
			{:else}
				<Fa {icon}/>
			{/if}
		{/if}
	{/if}
	{#if name}{name}{/if}
	{#if iconAlign === "right"}
		{#if icon}
			{#if typeof icon === "string"}
				<img class="h-[1em]" src={icon} alt="Icon"/>
			{:else}
				<Fa {icon}/>
			{/if}
		{/if}
	{/if}
</button>
