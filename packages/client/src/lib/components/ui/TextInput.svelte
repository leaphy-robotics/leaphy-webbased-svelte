<script lang="ts">
import SelectContext from "$components/ui/SelectContext.svelte";
import { onMount, tick } from "svelte";

interface Props {
	placeholder?: string;
	value: string;
	mode: "primary" | "secondary";
	rounded: boolean;
	focus?: boolean;
	required?: boolean;
	type?: string;
	input?: HTMLInputElement;
	suggestions?: string[];
}

let {
	placeholder,
	value = $bindable(""),
	mode,
	rounded,
	focus,
	required,
	type = "text",
	input = $bindable(),
	suggestions = [],
}: Props = $props();

let selected = $state(false);
let container = $state<HTMLDivElement>();
onMount(() => {
	if (focus) input.focus();
});

function getSuggestions(value: string) {
	return suggestions.filter((suggestion) =>
		suggestion.toUpperCase().includes(value.toUpperCase()),
	);
}

const relevantSuggestions = $derived(getSuggestions(value));

function onclick(event: MouseEvent) {
	if (container.contains(event.target as Node)) return;
	selected = false;
}
</script>

<svelte:body {onclick} />
<div bind:this={container} class="container">
	<input
		bind:this={input}
		class="input"
		{type}
		{placeholder}
		bind:value
		class:primary={mode === "primary"}
		class:secondary={mode === "secondary"}
		class:disableBottomRoundings={selected && relevantSuggestions.length > 0}
		class:rounded

		onfocus={() => selected = true}
		{required}
	/>
	{#if relevantSuggestions.length > 0}
		<SelectContext
			{mode}
			open={selected}
			options={relevantSuggestions.map(suggestion => [suggestion, suggestion])}
			onselect={newValue => {
				value = newValue;
				selected = false
			}}
		/>
	{/if}
</div>

<style>
	.container {
		position: relative;
	}
	.input {
		border: none;
		padding: 5px 10px;
		margin: 0;
		width: 100%;
		outline: 0;
		font-size: 1em;
	}

	.primary {
		background: var(--primary);
		color: var(--on-primary);
	}

	.secondary {
		background: var(--secondary);
		color: var(--on-secondary);
	}

	.rounded {
		border-radius: 20px;
	}

	.primary::placeholder {
		color: var(--text-muted);
	}

	.secondary::placeholder {
		color: var(--on-secondary-muted);
	}

	.disableBottomRoundings {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
</style>
