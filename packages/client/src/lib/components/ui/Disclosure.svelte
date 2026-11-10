<script lang="ts">
import type { Snippet } from "svelte";

interface Props {
	title: string;
	open?: boolean;
	children: Snippet;
}
let { title, open = $bindable(false), children }: Props = $props();
</script>

<details class="border-t border-secondary pt-3 text-left" bind:open>
	<summary class="cursor-pointer text-sm font-bold text-on-secondary-muted">{title}</summary>
	<div class="mt-3">{@render children()}</div>
</details>
