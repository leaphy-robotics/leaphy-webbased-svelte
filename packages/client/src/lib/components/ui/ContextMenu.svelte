<script lang="ts">
import { type Placement, computePosition, offset } from "@floating-ui/dom";
import { type Snippet, onDestroy, onMount } from "svelte";
import type { Writable } from "svelte/store";

const VERTICAL_PAD = 4; // py-1 = 4px

interface Props {
	source: HTMLElement;
	content: Snippet<[Writable<boolean>]>;
	anchor?: Placement;
	open: Writable<boolean>;
	shiftUp?: boolean;
}
let { source, content, anchor = "bottom-start", open, shiftUp = false }: Props = $props();

let element: HTMLDivElement;
let opening = true;
function close(event: MouseEvent) {
	if (opening) return (opening = false);
	if (element.contains(event.target as HTMLElement)) return;
	open.set(false);
}

let position = $state<{ x: number; y: number }>();
onMount(async () => {
	position = await computePosition(source, element, {
		strategy: "fixed",
		placement: anchor,
		middleware: [offset({ mainAxis: shiftUp ? 0 : 6, crossAxis: shiftUp ? -VERTICAL_PAD : 0 })],
	});

	document.body.addEventListener("click", close);
});

onDestroy(() => {
	document.body.removeEventListener("click", close);
});
</script>

<div
	bind:this={element}
	class="fixed bg-bg rounded-xl overflow-hidden z-[99998] shadow-[var(--shadow-el1)] py-1 flex flex-col"
	style:left={`${position?.x}px`}
	style:top={`${position?.y}px`}
>
	{@render content(open)}
</div>
