<script lang="ts">
import { type Placement, computePosition } from "@floating-ui/dom";
import { type Snippet, getContext, onDestroy, onMount } from "svelte";
import type { Writable } from "svelte/store";

interface Props {
	source: HTMLElement;
	content: Snippet<[Writable<boolean>]>;
	anchor?: Placement;
	open: Writable<boolean>;
}
let { source, content, anchor = "bottom-start", open }: Props = $props();

let element: HTMLTableElement;
let opening = true;
function close(event: MouseEvent) {
	if (opening) return (opening = false);
	if (element.contains(event.target as HTMLElement)) return;

	open.set(false);
}

let position = $state<{ x: number; y: number }>();
onMount(async () => {
	position = await computePosition(source, element as HTMLTableElement, {
		strategy: "fixed",
		placement: anchor,
	});

	document.body.addEventListener("click", close);
});

onDestroy(() => {
	document.body.removeEventListener("click", close);
});
</script>

<table
    bind:this={element}
    class="menu"
    style:left={`${position?.x}px`}
    style:top={`${position?.y}px`}
>
    {@render content(open)}
</table>

<style>
    .menu {
        position: fixed;
        background: var(--background);
        border-radius: 10px;
        overflow: hidden;
        z-index: 99998;
        box-shadow: var(--shadow-el1);
        padding-top: 10px;
        padding-bottom: 10px;
    }
</style>
