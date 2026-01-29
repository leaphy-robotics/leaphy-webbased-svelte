<script lang="ts">
interface Props {
	values: number[];
}
let { values }: Props = $props();

const size = 8;

let canvas = $state<HTMLCanvasElement>();
let ctx = $derived(canvas.getContext("2d"));

$effect(() => {
	if (!ctx) return;

	const imageData = ctx.createImageData(size, size);
	for (let i = 0; i < size * size; i++) {
		const value = Math.max(0, Math.min(1, values[i] ?? 0));

		const r = Math.round(255 * (1 - value));
		const g = Math.round(255 * value);
		const idx = i * 4;

		imageData.data[idx] = r;
		imageData.data[idx + 1] = g;
		imageData.data[idx + 2] = 0;
		imageData.data[idx + 3] = 255;
	}

	ctx.putImageData(imageData, 0, 0);
});
</script>

<canvas width={8} height={8} bind:this={canvas}></canvas>

<style>
    canvas {
        width: 100%;
		aspect-ratio: 1 / 1;
		image-rendering: pixelated;
		border-radius: 8px;
		overflow: hidden;
    }
</style>
