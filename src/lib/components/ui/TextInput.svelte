<script lang="ts">
import { onMount } from "svelte";

interface Props {
	placeholder?: string;
	value: string;
	mode: "primary" | "secondary";
	rounded: boolean;
	focus?: boolean;
	required?: boolean;
	type?: string;
}

let {
	placeholder,
	value = $bindable(""),
	mode,
	rounded,
	focus,
	required,
	type = "text"
}: Props = $props();

let input: HTMLInputElement;
onMount(() => {
	if (focus) input.focus();
});
</script>

<input
	bind:this={input}
	class="input"
	type={type}
	{placeholder}
	bind:value
	class:primary={mode === "primary"}
	class:secondary={mode === "secondary"}
	class:rounded
	{required}
/>

<style>
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
</style>
