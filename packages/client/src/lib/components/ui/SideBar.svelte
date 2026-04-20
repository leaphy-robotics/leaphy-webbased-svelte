<script lang="ts">
import type { Snippet } from "svelte";

interface Props {
	children: Snippet;
}
const { children }: Props = $props();
</script>

<div class="flex flex-col gap-12 p-5">
	{@render children()}
</div>
