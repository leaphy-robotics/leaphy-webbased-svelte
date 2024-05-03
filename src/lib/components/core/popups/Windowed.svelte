<script lang="ts">
import WindowButton from "$components/ui/WindowButton.svelte";
import type { PopupState } from "$state/popup.svelte";
import { popups } from "$state/popup.svelte";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { type Snippet, getContext, onDestroy, onMount } from "svelte";
import Fa from "svelte-fa";
import type { Writable } from "svelte/store";

interface Props {
	title: string;
	content: Snippet;
	actions?: Snippet;
}

const state = getContext<Writable<PopupState>>("state");
const { content, actions, title }: Props = $props();

let x: number;
let y: number;
let moving: boolean;
function ondown(e: MouseEvent) {
	x = e.pageX - $state.position.x;
	y = e.pageY - $state.position.y;
	moving = true;
}

function onmove(e: MouseEvent) {
	if (!moving) return;
	popups.move($state.id, {
		x: e.pageX - x,
		y: e.pageY - y,
	});
}

function onup() {
	moving = false;
}

function close() {
	popups.close($state.id);
}

onMount(() => {
	document.body.addEventListener("mousemove", onmove);
	document.body.addEventListener("mouseup", onup);
});
onDestroy(() => {
	document.body.removeEventListener("mousemove", onmove);
	document.body.removeEventListener("mouseup", onup);
});
</script>

<div class="window">
    <div class="top" onmousedown={ondown}>
        <div class="title">{title}</div>
        <div class="actions">
            <WindowButton icon={faClose} onclick={close} />
            {#if actions}{@render actions()}{/if}
        </div>
    </div>
    {@render content()}
</div>

<style>
    .window {
        display: flex;
        flex-direction: column;
    }

    .title {
        padding: 5px;
    }

    .top {
        background: var(--primary);
        justify-content: space-between;
        align-items: center;
        color: var(--on-primary);
        display: flex;
    }
</style>
