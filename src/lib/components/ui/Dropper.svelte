<script lang="ts">
import { explain } from "$domain/blockly/pseudo";
import BlocklyState from "$state/blockly.svelte";
import { faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";
import type * as Blockly from "blockly";
import { onDestroy, onMount } from "svelte";
import Fa from "svelte-fa";

function getBlockForPosition(event: PointerEvent) {
	return BlocklyState.workspace
		.getAllBlocks(true)
		.reverse()
		.find((block) => {
			const bounding = block.pathObject.svgPath.getBoundingClientRect();

			if (bounding.x > event.clientX || bounding.y > event.clientY)
				return false;
			return !(
				bounding.x + bounding.width < event.clientX ||
				bounding.y + bounding.height < event.clientY
			);
		});
}

let previous: Blockly.BlockSvg = null;
let selecting = false;
function pointerMove(event: PointerEvent) {
	if (!selecting) return;

	const block = getBlockForPosition(event);
	previous?.setHighlighted(false);
	block?.setHighlighted(true);

	previous = block;
}

async function select(event: PointerEvent) {
	if (!selecting) return;

	previous?.setHighlighted(false);
	selecting = false;

	const block = getBlockForPosition(event);
	if (!block) return;

	await explain(block);
}

function onclick() {
	selecting = true;
}

onMount(() => {
	document.body.addEventListener("pointermove", pointerMove);
	document.body.addEventListener("pointerup", select);
});
onDestroy(() => {
	document.body.removeEventListener("pointermove", pointerMove);
	document.body.removeEventListener("pointerup", select);
});
</script>

<button class="dropper" class:selecting {onclick}>
	<Fa icon="{faMagicWandSparkles}" />
</button>
{#if selecting}
	<div class="noInteract"></div>
{/if}

<style>
	.dropper {
		all: unset;
		position: fixed;
		bottom: 35px;
		right: 116px;
		color: rgba(136, 136, 136, 0.5);
		font-size: 45px;
		cursor: pointer;
	}

	.selecting {
		color: rgba(84, 93, 149, 0.5);
	}

	.noInteract {
		position: fixed;
		left: 0;
		top: 0;
		width: 100vw;
		height: 100vh;
		z-index: 9999999999;
		cursor: crosshair;
	}
</style>
