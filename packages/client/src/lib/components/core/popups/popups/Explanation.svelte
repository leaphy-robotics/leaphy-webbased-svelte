<script lang="ts">
import AIState from "$state/ai.svelte";
import BlocklyState from "$state/blockly.svelte";
import type { PopupState } from "$state/popup.svelte";
import { track } from "$state/utils";
import { autoPlacement, computePosition, size } from "@floating-ui/dom";
import { arduino } from "@leaphy-robotics/leaphy-blocks";
import { layoutComponents } from "@leaphy-robotics/schemas";
import { type Block, Events } from "blockly";
import { getContext, onMount } from "svelte";
import { _ } from "svelte-i18n";
import SvelteMarkdown from "svelte-markdown";

let position = $state<{ x: number; y: number }>();
let element: HTMLDivElement;
function click(event: MouseEvent) {
	if (element.contains(event.target as HTMLElement)) return;
	AIState.visible = false;
}

let circuitCanvas = $state<HTMLCanvasElement>();
let showCircuit = $state(false);

async function calculatePosition() {
	position = await computePosition(
		AIState.block.getSvgRoot().querySelector(".blocklyPath"),
		element,
		{
			placement: "right-start",
			strategy: "fixed",
			middleware: [
				autoPlacement(),
				size({
					apply({ availableWidth, availableHeight, elements }) {
						Object.assign(elements.floating.style, {
							maxWidth: `${Math.max(0, availableWidth)}px`,
							maxHeight: `${Math.max(0, availableHeight)}px`,
						});
					},
				}),
			],
		},
	);
}

$effect(() => {
	track(AIState.loading);
	track(AIState.content);

	calculatePosition();
});

onMount(async () => {
	arduino.createSchemaBuilder();
	arduino.forBlock[AIState.block.type](AIState.block, arduino);
	if (arduino.builder && arduino.builder.components.length > 1) {
		await layoutComponents(circuitCanvas, arduino.builder);
		showCircuit = true;
	}

	BlocklyState.workspace.fireChangeListener(new Events.UiBase());

	await calculatePosition();
});
</script>

<svelte:body onclick={click} />
<div
	bind:this={element}
	class="fixed overflow-y-auto shadow-[var(--shadow-el2)] w-[400px] p-5 rounded-2xl bg-bg text-on-bg"
	style:top={`${position?.y}px`}
	style:left={`${position?.x}px`}
>
	<h2 class="mt-0">{$_("EXPLANATION")}</h2>

	<canvas bind:this={circuitCanvas} class="w-full {showCircuit ? 'block' : 'hidden'}"></canvas>

	{#if AIState.loading}
		<div class="flex flex-col gap-1.5 my-4">
			{#each [0,1,2,3] as _}
				<div class="h-3.5 w-full rounded" style="background: linear-gradient(100deg, rgba(255,255,255,0) 40%, rgba(255,255,255,.5) 50%, rgba(255,255,255,0) 60%) #a5a5a550; background-size: 200% 100%; animation: 1s loading ease-in-out infinite;"></div>
			{/each}
		</div>
	{:else if AIState.content}
		<SvelteMarkdown source={AIState.content} />
	{:else}
		<div class="flex flex-col gap-1.5 my-4">{$_("AI_RATE_LIMITED")}</div>
	{/if}
</div>

<style>
@keyframes loading {
	to { background-position-x: -20%; }
}
</style>
