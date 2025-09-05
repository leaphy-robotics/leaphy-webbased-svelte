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
	// Render block to svg
	arduino.clearBuilder();
	arduino.forBlock[AIState.block.type](AIState.block, arduino);
	if (arduino.builder.components.length > 1) {
		await layoutComponents(circuitCanvas, arduino.builder);
		showCircuit = true;
	}

	BlocklyState.workspace.fireChangeListener(new Events.UiBase());

	// Calculate position
	await calculatePosition();
});
</script>

<svelte:body onclick={click} />
<div class="content" bind:this={element} style:top={`${position?.y}px`} style:left={`${position?.x}px`}>
	<h2>{$_("EXPLANATION")}</h2>

	<canvas bind:this={circuitCanvas} style:display={showCircuit ? 'block' : 'none'} class="circuit"></canvas>

	{#if AIState.loading}
		<div class="container">
			<div class="loading"></div>
			<div class="loading"></div>
			<div class="loading"></div>
			<div class="loading"></div>
		</div>
	{:else if AIState.content}
		<SvelteMarkdown source={AIState.content} />
	{:else}
		<div class="container">
			{$_("AI_RATE_LIMITED")}
		</div>
	{/if}
</div>

<style>
	.content {
		position: fixed;
		top: 0;
		left: 0;

		overflow-y: auto;
		box-shadow: var(--shadow-el2);

		width: 400px;
		padding: 20px;
		border-radius: 20px;

		background: var(--background);
		color: var(--on-background);
	}

	.circuit {
		width: 100%;
	}

	.container {
		display: flex;
		flex-direction: column;
		gap: 5px;
		margin: 16px 0;
	}

	.loading {
		background: linear-gradient(
			100deg,
			rgba(255, 255, 255, 0) 40%,
			rgba(255, 255, 255, .5) 50%,
			rgba(255, 255, 255, 0) 60%
		) #a5a5a550;
		background-size: 200% 100%;
		background-position-x: 180%;
		animation: 1s loading ease-in-out infinite;

		height: 14px;
		width: 100%;
	}

	@keyframes loading {
		to {
			background-position-x: -20%;
		}
	}
</style>
