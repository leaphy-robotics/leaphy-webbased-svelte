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

<div class="flex flex-col">
	<div
		class="bg-primary justify-content-between items-center text-on-primary flex px-2.5 py-1.5 rounded-t-xl cursor-move select-none"
		onmousedown={ondown}
	>
		<div class="text-lg flex-1">{title}</div>
		<div class="flex gap-1.5 items-center">
			{#if actions}{@render actions()}{/if}
			<WindowButton icon={faClose} onclick={close} />
		</div>
	</div>
	{@render children()}
</div>
