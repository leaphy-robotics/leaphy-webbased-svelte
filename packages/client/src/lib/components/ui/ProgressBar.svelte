<script lang="ts">
interface Props {
	progress: number;
	// Shows an animated bar when the duration is unknown
	indeterminate?: boolean;
}
const { progress, indeterminate = false }: Props = $props();
</script>

<div
	class="relative bg-secondary w-full h-3.5 rounded-full overflow-hidden"
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={indeterminate ? undefined : Math.round(progress)}
>
	{#if indeterminate}
		<div class="indeterminate absolute bg-primary top-0 h-full w-1/3 rounded-full"></div>
	{:else}
		<div
			class="absolute bg-primary top-0 left-0 h-full transition-all duration-300 rounded-full"
			style:width={`${progress}%`}
		></div>
	{/if}
</div>

<style>
	.indeterminate {
		animation: indeterminate 1.4s ease-in-out infinite;
	}
	@keyframes indeterminate {
		from {
			left: -33%;
		}
		to {
			left: 100%;
		}
	}
</style>
