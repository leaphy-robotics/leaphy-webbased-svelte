<script lang="ts">
import {
	faCaretDown,
	faCaretRight,
	faFile,
	faFolder,
} from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";
import type { Tree as TreeType } from "./Tree.types";
import Tree from "./Tree.svelte"

interface Props {
	tree: TreeType;
	selected: string[] | null;
	onselect: (selection: string[]) => void;
	oncreate: (path: string[], type: "file" | "folder") => void;
	indent?: number;
}
let { tree, selected, indent = 0, onselect, oncreate }: Props = $props();

let open = $state(!!selected);
function interact() {
	open = !open;
}

function createFile() {
	oncreate([], "file");
}
function createFolder() {
	oncreate([], "folder");
}
</script>

<div class="tree" style:--indent={`${indent}px`}>
    <div class="header-wrap">
        <button class="header" onclick={interact}>
            <Fa icon={open ? faCaretDown : faCaretRight} />
            <div class="name">{tree.name}</div>
        </button>
        <div class="actions">
            <button class="action" onclick={createFile}>
                <Fa icon={faFile} />
            </button>
            <button class="action" onclick={createFolder}>
                <Fa icon={faFolder} />
            </button>
        </div>
    </div>
    {#if open}
        <div class="content">
            {#each tree.contents as item (item)}
                {#if typeof item === "string"}
                    <button class="item" class:selected={selected?.at(0) === item} onclick={() => onselect([item])}>{item}</button>
                {:else}
                    <Tree
                        tree={item}
                        selected={selected?.at(0) === item.name ? selected.slice(1) : null}
                        indent={indent + 25}
                        onselect={(selection: string[]) => onselect([item.name, ...selection])}
                        oncreate={(path: string[], type: "file"|"folder") => oncreate([item.name, ...path], type)}
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

    .header-wrap {
        position: relative;
    }

	.item {
		all: unset;
		padding-left: calc(var(--indent) + 25px);
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

    .header:hover, .item:hover {
        background: var(--secondary);
    }

    .selected {
        font-weight: bold;
        background: var(--secondary);
    }

    .actions {
        display: flex;
        position: absolute;
        right: 5px;
        top: 50%;
        translate: 0 -50%;
        gap: 3px;
        font-size: 10px;
    }

    .action {
        padding: 3px;
        border-radius: 3px;
        color: var(--on-secondary);
        border: none;
        background: transparent;
    }
    .action:hover {
        background: var(--secondary);
    }
</style>
