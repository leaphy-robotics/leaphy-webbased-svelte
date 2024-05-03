<script lang="ts">
	import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
	import Fa from "svelte-fa";
	import type { Tree } from "./Tree.types";

    interface Props {
        tree: Tree,
        selected: string[]|null,
        onselect: (selection: string[]) => void,
        indent?: number
    }
    let { tree, selected, indent = 0, onselect }: Props = $props()

    let open = $state(!!selected)
    function interact() {
        open = !open
    }
</script>

<div class="tree" style:--indent={`${indent}px`}>
    <button class="header" onclick={interact}>
        <Fa icon={open ? faCaretDown : faCaretRight} />
        <div class="name">{tree.name}</div>
    </button>
    {#if open}
        <div class="content">
            {#each tree.contents as item (item)}
                {#if typeof item === "string"}
                    <button class="item" class:selected={selected?.at(0) === item} onclick={() => onselect([item])}>{item}</button>
                {:else}
                    <svelte:self 
                        tree={item} 
                        selected={selected?.at(0) === item.name ? selected.slice(1) : null} 
                        indent={indent + 25} 
                        onselect={(selection: string[]) => onselect([item.name, ...selection])} 
                    />
                {/if}
            {/each}
        </div>
    {/if}
</div>

<style>
    .tree {
        display: flex;
        flex-direction: column;
    }
    .header, .item {
        display: flex;
        gap: 3px;
        border: none;
        background: var(--background-tint);
        color: var(--on-background);
        padding-left: var(--indent);
        width: 100%;
        text-align: left;
    }
    .item {
        padding-left: calc(var(--indent) + 25px);
    }

    .header:hover, .item:hover {
        background: var(--secondary);
    }

    .selected {
        font-weight: bold;
        background: var(--secondary);
    }
</style>
