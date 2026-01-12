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
</script>

<textarea
	bind:this={input}
	class="textarea"
	bind:value
	rows={rows}
	{required}
	class:primary={mode === "primary"}
	class:secondary={mode === "secondary"}
	class:large
	{placeholder}
></textarea>

<style>
	.textarea {
		font-family: inherit;
		border: none;
		padding: 5px 10px;
		margin: 0;
		width: 100%;
		outline: 0;
		font-size: 1em;
		border-radius: 10px;
	}

	.large {
		font-size: 1.1em;
		padding: 10px 15px;
		border-radius: 20px;
	}

	.primary {
		background: var(--primary);
		color: var(--on-primary);
	}

	.secondary {
		background: var(--secondary);
		color: var(--on-secondary);
	}

	.primary::placeholder {
		color: var(--text-muted);
	}

	.secondary::placeholder {
		color: var(--on-secondary-muted);
	}
</style>
