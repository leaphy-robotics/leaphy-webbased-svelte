<script lang="ts">
import * as Blockly from "blockly";
import { onMount } from "svelte";
import { dark, light } from "$domain/blockly/theme";
import AppState, { Theme } from "$state/app.svelte";

interface Props {
	/** Block in Blockly's JSON serialization format */
	block: Blockly.serialization.blocks.State;
	scale?: number;
}

const { block, scale = 0.8 }: Props = $props();

const PADDING = 4;

let container = $state<HTMLDivElement>();

onMount(() => {
	if (!container) return;

	const workspace = Blockly.inject(container, {
		renderer: "zelos",
		media: "blockly-assets",
		theme: AppState.theme === Theme.DARK ? dark : light,
		readOnly: true,
		zoom: { startScale: scale },
		move: { scrollbars: false, drag: false, wheel: false },
	});

	const preview = Blockly.serialization.blocks.append(
		block,
		workspace,
	) as Blockly.BlockSvg;

	// Rendering is deferred, wait for it before measuring the block
	Blockly.renderManagement.finishQueuedRenders().then(() => {
		if (!container) return;

		const bounds = preview.getBoundingRectangle();
		container.style.width = `${bounds.getWidth() * scale + PADDING * 2}px`;
		container.style.height = `${bounds.getHeight() * scale + PADDING * 2}px`;
		Blockly.svgResize(workspace);
		workspace.translate(
			-bounds.left * scale + PADDING,
			-bounds.top * scale + PADDING,
		);
	});

	return () => workspace.dispose();
});
</script>

<div class="block-preview" bind:this={container}></div>

<style>
	.block-preview {
		width: 0;
		height: 0;
		overflow: hidden;
	}

	/* Show the block itself only, without the workspace grid and background */
	.block-preview :global(.blocklyMainBackground) {
		fill: transparent;
		stroke: none;
	}

	.block-preview :global(.blocklySvg) {
		background: transparent;
	}
</style>
