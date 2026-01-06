<script lang="ts">
import WindowButton from "$components/ui/WindowButton.svelte";
import type { PopupState } from "$state/popup.svelte";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { type Snippet, getContext, onDestroy, onMount } from "svelte";
import Fa from "svelte-fa";

interface Props {
	title: string;
	children: Snippet;
	actions?: Snippet;
}

const popupState = getContext<PopupState>("state");
const { children, actions, title }: Props = $props();

let x: number;
let y: number;
let moving: boolean;
function ondown(e: MouseEvent) {
	x = e.pageX - popupState.position.x;
	y = e.pageY - popupState.position.y;
	moving = true;
}

function onmove(e: MouseEvent) {
	if (!moving) return;
	popupState.position = {
		x: e.pageX - x,
		y: e.pageY - y,
	};
}

function onup() {
	moving = false;
}

function close() {
	popupState.close();
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
            {#if actions}{@render actions()}{/if}
			<WindowButton icon={faClose} onclick={close} />
		</div>
    </div>
    {@render children()}
</div>

<style>
    .window {
        display: flex;
        flex-direction: column;
    }

    .title {
		padding-left: 5px;
		font-size: 18px;
    }

    .top {
        background: var(--primary);
        justify-content: space-between;
        align-items: center;
        color: var(--on-primary);
        display: flex;
		padding: 5px;
		border-radius: 10px 10px 0 0;
    }

	.actions {
		display: flex;
		gap: 5px;
	}
</style>
