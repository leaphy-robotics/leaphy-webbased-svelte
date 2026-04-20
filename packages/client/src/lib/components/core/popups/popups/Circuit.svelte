<script lang="ts">
import { track } from "$state/utils";
import WorkspaceState from "$state/workspace.svelte";
import { arduino } from "@leaphy-robotics/leaphy-blocks";
import { layoutComponents } from "@leaphy-robotics/schemas";
import { _ } from "svelte-i18n";
import Windowed from "../Windowed.svelte";

let canvas = $state<HTMLCanvasElement>();
let cssWidth = $state("auto");
let cssHeight = $state("auto");

$effect(() => {
	track(WorkspaceState.code);
	layoutComponents(canvas, arduino.builder).then(() => {
		if (!canvas) return;
		const maxW = window.innerWidth * 0.8;
		const maxH = window.innerHeight * 0.8;
		const ratio = canvas.width / canvas.height;
		if (maxW / ratio <= maxH) {
			cssWidth = `${maxW}px`;
			cssHeight = `${maxW / ratio}px`;
		} else {
			cssWidth = `${maxH * ratio}px`;
			cssHeight = `${maxH}px`;
		}
	});
});
</script>

<Windowed title={$_("CIRCUIT")}>
	<div class="bg-bg-tint flex items-center justify-center" style="width: {cssWidth}; height: {cssHeight};">
		<canvas bind:this={canvas} style="width: {cssWidth}; height: {cssHeight};"></canvas>
	</div>
</Windowed>
