<script lang="ts">
import {
	type IconDefinition,
	faCaretRight,
} from "@fortawesome/free-solid-svg-icons";
import { type Snippet, onDestroy, onMount } from "svelte";
import Fa from "svelte-fa";
import type { Writable } from "svelte/store";
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
	if (!onclick || disabled) return;

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

<tbody bind:this={element}>
    {#if contextShowing}
        <ContextMenu anchor="right-start" source={element} content={context} {open} />
    {/if}

    <tr
        class="item"
        onclick={interact}
        onmousemove={hover}
        class:disabled
        class:selected
    >
        <td class="icon">
            {#if icon}<Fa {icon} />{/if}
        </td>
        <td class="name">
            {name}
            {#if context}<Fa icon={faCaretRight} />{/if}
        </td>
    </tr>
</tbody>

<style>
    .item {
        background: var(--background);
        height: 38px;
        cursor: pointer;
    }
    .item:hover {
        background: var(--background-tint);
    }

    .icon {
        padding: 10px 10px 10px 20px;
        color: var(--primary-dark-tint);
        text-align: center;
    }

    .name {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 30px 0 0;
        height: 38px;
    }

    .disabled {
        background: var(--background) !important;
        opacity: 0.5;
    }

    .selected {
        color: var(--primary-dark-tint);
    }
</style>
