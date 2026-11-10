<script lang="ts">
import { faLock } from "@fortawesome/free-solid-svg-icons";
import type { Snippet } from "svelte";
import Fa from "svelte-fa";

interface Props {
	locked: boolean;
	// Tells the user what to do to unlock the content
	reason: string;
	children: Snippet;
}
const { locked, reason, children }: Props = $props();
</script>

<div class="relative flex min-h-0 flex-col">
	<div class="flex min-h-0 flex-1 flex-col transition-opacity {locked ? 'pointer-events-none opacity-35 select-none' : ''}" inert={locked}>
		{@render children()}
	</div>
	{#if locked}
		<div class="absolute inset-0 z-10 grid place-items-center p-4">
			<div class="flex max-w-xs items-center gap-2.5 rounded-xl bg-bg px-4 py-3 text-left text-sm shadow-card">
				<Fa icon={faLock} />
				<span>{reason}</span>
			</div>
		</div>
	{/if}
</div>
