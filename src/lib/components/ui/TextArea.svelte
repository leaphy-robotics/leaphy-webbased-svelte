<script lang="ts">
import { onMount } from "svelte";

interface Props {
	value: string;
	mode: "primary" | "secondary";
	rounded: boolean;
	focus?: boolean;
	rows: number;
}
let { value = $bindable(""), mode, rounded, focus, rows }: Props = $props();

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
    class:primary={mode === "primary"}
    class:secondary={mode === "secondary"}
    class:rounded
></textarea>

<style>
    .textarea {
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
        border-radius: 10px;
    }

    .primary::placeholder {
        color: var(--text-muted);
    }
    .secondary::placeholder {
        color: var(--on-secondary-muted);
    }
</style>
