<script lang="ts" module>
export interface ChecklistItem {
	label: string;
	done: boolean;
}
</script>

<script lang="ts">
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";


interface Props {
	items: ChecklistItem[];
}
const { items }: Props = $props();

// The first unfinished item is what the user should do now
const currentIndex = $derived(items.findIndex((item) => !item.done));
</script>

<ul class="m-0 flex list-none flex-col gap-1 p-0 text-left text-sm">
	{#each items as item, index}
		<li class="flex items-start gap-2.5 rounded-xl px-2.5 py-1.5 {index === currentIndex ? 'bg-primary text-on-primary font-bold' : ''}">
			<span
				class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 text-[10px]
					{item.done ? 'border-success bg-success text-white' : index === currentIndex ? 'border-on-primary' : 'border-secondary'}"
			>
				{#if item.done}<Fa icon={faCheck} />{/if}
			</span>
			<span class={item.done ? "line-through opacity-60" : ""}>{item.label}</span>
		</li>
	{/each}
</ul>
