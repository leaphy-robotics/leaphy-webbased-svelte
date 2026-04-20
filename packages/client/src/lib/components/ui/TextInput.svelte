<script lang="ts">
import SelectContext from "$components/ui/SelectContext.svelte";
import { onMount, tick } from "svelte";

interface Props {
	placeholder?: string;
	value: string;
	mode: "primary" | "secondary" | "background";
	rounded: boolean;
	focus?: boolean;
	required?: boolean;
	type?: string;
	input?: HTMLInputElement;
	suggestions?: string[];
	large?: boolean;
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
	large = false,
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

const modeClasses = {
	primary: "bg-primary text-on-primary placeholder:text-text-muted",
	secondary: "bg-secondary text-on-secondary placeholder:text-on-secondary-muted",
	background: "bg-bg text-on-bg",
};
</script>

<svelte:body {onclick} />
<div bind:this={container} class="relative">
	<input
		bind:this={input}
		{type}
		{placeholder}
		bind:value
		onfocus={() => selected = true}
		{required}
		class="border-none w-full outline-none font-[inherit] h-9
			{modeClasses[mode]}
			{large ? 'text-lg px-4' : 'px-2.5'}
			{rounded ? 'rounded-full' : 'rounded-none'}
			{selected && relevantSuggestions.length > 0 ? 'rounded-bl-none rounded-br-none' : ''}"
	/>
	{#if relevantSuggestions.length > 0}
		<SelectContext
			element={input}
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
