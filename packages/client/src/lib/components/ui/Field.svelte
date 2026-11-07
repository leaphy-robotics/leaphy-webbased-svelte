<script lang="ts">
import type { Snippet } from "svelte";

interface Props {
	label: string;
	// Plain language explanation of what the field does
	hint?: string;
	children: Snippet;
}
const { label, hint, children }: Props = $props();
</script>

<div class="flex flex-col gap-1.5 text-left">
	<div class="flex flex-col">
		<div class="font-bold">{label}</div>
		{#if hint}<div class="text-sm text-on-secondary-muted">{hint}</div>{/if}
	</div>
	{@render children()}
</div>
