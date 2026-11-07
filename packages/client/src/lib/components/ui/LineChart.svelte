<script lang="ts">
interface Props {
	values: number[];
	label: string;
	// Text shown while there are no values yet
	placeholder?: string;
}
const { values, label, placeholder }: Props = $props();

const width = 330;
const height = 170;
const padding = 12;

const path = $derived.by(() => {
	if (!values.length) return "";
	const min = Math.min(...values);
	const span = Math.max(0.000001, Math.max(...values) - min);
	return values
		.map((value, index) => {
			const x =
				padding +
				(index / Math.max(1, values.length - 1)) * (width - padding * 2);
			const y =
				height - padding - ((value - min) / span) * (height - padding * 2);
			return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
		})
		.join(" ");
});
</script>

<div class="relative">
	<svg class="block w-full" viewBox="0 0 {width} {height}" role="img" aria-label={label}>
		<line class="stroke-secondary stroke-1" x1={padding} y1={height - padding} x2={width - padding} y2={height - padding}></line>
		<line class="stroke-secondary stroke-1" x1={padding} y1={padding} x2={padding} y2={height - padding}></line>
		{#if path}<path class="fill-none stroke-accent stroke-[3]" stroke-linecap="round" stroke-linejoin="round" d={path}></path>{/if}
	</svg>
	{#if !values.length && placeholder}
		<span class="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs text-on-secondary-muted">{placeholder}</span>
	{/if}
</div>
