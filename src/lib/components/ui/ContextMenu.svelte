<script lang="ts">
    import {
        getContext,
        onDestroy,
        onMount,
        type Snippet,
    } from "svelte";
    import { computePosition, type Placement } from "@floating-ui/dom";
    import { type Writable } from "svelte/store";

    interface Props {
        source: HTMLElement;
        content: Snippet;
        anchor?: Placement;
    }
    let { source, content, anchor = "bottom-start" }: Props = $props();

    const open = getContext<Writable<boolean>>("open");

    let element: HTMLTableElement;
    let opening = true;
    function close(event: MouseEvent) {
        if (opening) return (opening = false);
        if (element.contains(event.target as HTMLElement)) return;

        open.update(() => false);
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
    {@render content()}
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
