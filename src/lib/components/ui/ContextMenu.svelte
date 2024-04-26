<script lang="ts">
    import { onMount, type Snippet } from "svelte";
    import { computePosition, offset } from "@floating-ui/dom"

    interface Props {
        source: HTMLElement,
        content: Snippet
    }
    let { source, content }: Props = $props()
    let element: HTMLDivElement

    let position = $state<{ x: number, y: number }>()
    onMount(async () => {
        console.log(source, element)
        position = await computePosition(source, element, {
            strategy: "fixed",
            placement: "bottom",
            middleware: [offset(0)]
        })
    })
</script>

<table bind:this={element} class="menu" style:left={`${position?.x}px`} style:top={`${position?.y}px`}>
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
