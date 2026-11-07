<script lang="ts">
import Checklist, { type ChecklistItem } from "$components/ui/Checklist.svelte";
import TipCard from "$components/ui/TipCard.svelte";

interface Props {
	title: string;
	items: ChecklistItem[];
	tip?: { title: string; text: string };
}
const { title, items, tip }: Props = $props();
</script>

<section class="flex flex-col gap-3 rounded-2xl bg-bg p-4">
	<h2 class="m-0 text-left text-base!">{title}</h2>
	<Checklist {items} />
	{#if tip}
		<TipCard title={tip.title} text={tip.text} />
	{/if}
</section>
