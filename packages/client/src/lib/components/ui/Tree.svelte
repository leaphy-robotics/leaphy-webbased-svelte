<script lang="ts">
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
	faCaretDown,
	faCaretRight,
	faFile,
	faFolder,
} from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";
import Tree from "./Tree.svelte";
import type { Tree as TreeType } from "./Tree.types";

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

<div class="flex flex-col">
	<div class="relative">
		<button
			class="flex gap-1 border-none bg-bg-tint text-on-bg w-full text-left hover:bg-secondary transition-colors"
			style:padding-left={`${indent}px`}
			onclick={interact}
		>
			<Fa icon={open ? faCaretDown : faCaretRight} />
			<span>{tree.name}</span>
		</button>
		{#snippet treeAction(icon: IconDefinition, onclick: () => void)}
			<button class="p-1 rounded-sm text-on-secondary border-none bg-transparent hover:bg-secondary transition-colors" {onclick}>
				<Fa {icon} />
			</button>
		{/snippet}
		<div class="flex absolute right-1.5 top-1/2 -translate-y-1/2 gap-1 text-xs">
			{@render treeAction(faFile, createFile)}
			{@render treeAction(faFolder, createFolder)}
		</div>
	</div>
	{#if open}
		<div>
			{#each tree.contents as item (item)}
				{#if typeof item === "string"}
					<button
						class="flex gap-1 border-none bg-bg-tint text-on-bg w-full text-left hover:bg-secondary transition-colors
							{selected?.at(0) === item ? 'font-bold bg-secondary' : ''}"
						style:padding-left={`${indent + 25}px`}
						onclick={() => onselect([item])}
					>{item}</button>
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
