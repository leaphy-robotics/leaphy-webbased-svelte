<script lang="ts">
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import type { Snippet } from "svelte";
import Fa from "svelte-fa";

interface Props {
	children: Snippet;
	title?: string;
	icon?: IconDefinition;
}
let { children, title, icon }: Props = $props();
</script>

<div class="flex flex-col gap-2.5 p-2.5 bg-bg rounded-xl border border-secondary">
	{#if title}
		<div class="flex items-center gap-2.5 text-xl font-bold">
			<Fa {icon} />
			{title}
		</div>
	{/if}
	{@render children()}
</div>
