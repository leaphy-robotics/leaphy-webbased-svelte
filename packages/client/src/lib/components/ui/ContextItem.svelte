<script lang="ts">
import {
	faCaretRight,
	type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { onDestroy, onMount, type Snippet } from "svelte";
import type { Writable } from "svelte/store";
import Fa from "svelte-fa";
import ContextMenu from "./ContextMenu.svelte";

interface Props {
	icon?: IconDefinition;
	name: string;
	onclick?: () => void;
	context?: Snippet<[Writable<boolean>]>;
	disabled?: boolean;
	selected?: boolean;
	open: Writable<boolean>;
}
let {
	icon,
	name,
	onclick,
	context,
	disabled = false,
	selected = false,
	open,
}: Props = $props();

let element = $state<HTMLDivElement>();
let contextShowing = $state(false);

function interact() {
	if (!onclick) return;
	open.set(false);
	onclick();
}

function hover() {
	if (!context) return;
	contextShowing = true;
}

function blur(event: MouseEvent) {
	if (element.contains(event.target as HTMLElement)) return;
	contextShowing = false;
}

onMount(() => {
	document.body.addEventListener("mousemove", blur);
});
onDestroy(() => {
	document.body.removeEventListener("mousemove", blur);
});
</script>

<div bind:this={element} class="w-full">
	{#if contextShowing}
		<ContextMenu anchor="right-start" source={element} content={context} {open} shiftUp />
	{/if}

	<div
		class="h-10 flex items-center cursor-pointer bg-bg hover:bg-bg-tint
			{disabled ? 'opacity-50 !bg-bg' : ''}
			{selected ? 'text-primary-dark' : ''}"
		onclick={interact}
		onmousemove={hover}
	>
		<div class="w-14 flex justify-center items-center text-primary-dark shrink-0">{#if icon}<Fa {icon} />{/if}</div>
		<div class="flex flex-1 justify-between items-center pr-12 gap-8">
			{name}
			{#if context}<Fa icon={faCaretRight} />{/if}
		</div>
	</div>
</div>
