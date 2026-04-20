<script lang="ts">
import AIState from "$state/ai.svelte";
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

	await AIState.explain(block);
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

<button
	class="fixed bottom-9 right-[116px] text-5xl cursor-pointer bg-transparent border-none p-0
		{selecting ? 'text-[rgba(84,93,149,0.5)]' : 'text-[rgba(136,136,136,0.5)]'}"
	{onclick}
>
	<Fa icon="{faMagicWandSparkles}" />
</button>
{#if selecting}
	<div class="fixed left-0 top-0 w-screen h-screen z-[9999999999] cursor-crosshair"></div>
{/if}
