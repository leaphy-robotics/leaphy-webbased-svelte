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

<div class="w-full h-full">
    <canvas class="w-full h-full" bind:this={canvas}></canvas>
</div>
