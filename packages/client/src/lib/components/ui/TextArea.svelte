<script lang="ts">
import { onMount } from "svelte";

interface Props {
	value: string;
	mode: "primary" | "secondary";
	focus?: boolean;
	rows: number;
	required?: boolean;
	large?: boolean;
	placeholder?: string;
}

let {
	value = $bindable(""),
	mode,
	focus,
	rows,
	required = false,
	large = false,
	placeholder = "",
}: Props = $props();

let input: HTMLTextAreaElement;
onMount(() => {
	if (focus) input.focus();
});

const modeClasses = {
	primary: "bg-primary text-on-primary placeholder:text-text-muted",
	secondary:
		"bg-secondary text-on-secondary placeholder:text-on-secondary-muted",
};
</script>

<textarea
	bind:this={input}
	bind:value
	{rows}
	{required}
	{placeholder}
	class="font-[inherit] border-none w-full outline-none
		{modeClasses[mode]}
		{large ? 'text-lg px-4 py-2.5 rounded-full' : 'px-2.5 py-1.5 rounded-xl'}"
></textarea>
