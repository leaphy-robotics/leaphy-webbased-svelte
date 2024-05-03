<script lang="ts">
import {
	faCaretRight,
	type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { getContext, onDestroy, onMount, type Snippet } from "svelte";
import Fa from "svelte-fa";
import type { Writable } from "svelte/store";
import ContextMenu from "./ContextMenu.svelte";

interface Props {
	icon?: IconDefinition;
	name: string;
	onclick?: () => void;
	context?: Snippet;
	disabled?: boolean;
	selected?: boolean;
}
const {
	icon,
	name,
	onclick,
	context,
	disabled = false,
	selected = false,
}: Props = $props();

const element = $state<HTMLDivElement>();
let contextShowing = $state(false);

const open = getContext<Writable<boolean>>("open");
function interact() {
	if (!onclick) return;

	open.update(() => false);
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
        <ContextMenu anchor="right-start" source={element} content={context} />
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
