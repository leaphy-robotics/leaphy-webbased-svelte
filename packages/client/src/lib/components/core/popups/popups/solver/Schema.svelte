<script lang="ts">
import type { ComponentBuilder } from "@leaphy-robotics/schemas";
import { layoutComponents } from "@leaphy-robotics/schemas";

interface Props {
	builder: ComponentBuilder;
}

let { builder }: Props = $props();

let canvas = $state<HTMLCanvasElement>();
$effect(() => {
	layoutComponents(canvas, builder);
});
</script>

<div class="content">
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    .content {
        width: 100%;
        height: 100%;
    }

    canvas {
        width: 100%;
        height: 100%;
    }
</style>
