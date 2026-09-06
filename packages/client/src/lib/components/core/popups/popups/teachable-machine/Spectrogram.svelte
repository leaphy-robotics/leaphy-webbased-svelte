<script lang="ts">
import { renderSpectrogram } from "@leaphy-robotics/teachable-machine/spectrogram";

interface Props {
	logMel: Float32Array;
	label: string;
}

const { logMel, label }: Props = $props();
let canvas = $state<HTMLCanvasElement>();

$effect(() => {
	if (canvas && logMel) renderSpectrogram(canvas, logMel);
});
</script>

<canvas
	bind:this={canvas}
	aria-label={label}
	title={label}
	class="block h-12 w-[82px] rounded-lg"
></canvas>
