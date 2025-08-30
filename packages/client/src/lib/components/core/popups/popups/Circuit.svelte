<script lang="ts">
import { track } from "$state/utils";
import WorkspaceState from "$state/workspace.svelte";
import { arduino } from "@leaphy-robotics/leaphy-blocks";
import { layoutComponents } from "@leaphy-robotics/schemas";
import { onMount } from "svelte";
import { _ } from "svelte-i18n";
import Windowed from "../Windowed.svelte";

let canvas = $state<HTMLCanvasElement>();
$effect(() => {
	track(WorkspaceState.code);
	layoutComponents(canvas, arduino.builder);
});
</script>

<Windowed title={$_("CIRCUIT")}>
	<div class="content">
		<canvas bind:this={canvas}></canvas>
	</div>
</Windowed>

<style>
	.content {
		overflow-y: auto;
		background: var(--background-tint);
		width: 100%;
		height: 100%;
	}

	canvas {
		width: -webkit-fill-available;
		height: -webkit-fill-available;

		max-width: 80vw;
		max-height: 80vh;
	}
</style>
