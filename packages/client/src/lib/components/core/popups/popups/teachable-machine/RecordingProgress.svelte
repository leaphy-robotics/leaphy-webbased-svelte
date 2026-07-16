<script lang="ts">
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { tick } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";

interface Props {
	total: number;
	current: number;
	progress: number;
	received: number;
	message: string;
}

const { total, current, progress, received, message }: Props = $props();
const circumference = 2 * Math.PI * 15;
let indicatorScroller = $state<HTMLDivElement>();

$effect(() => {
	const target = Math.max(current, received);
	if (!indicatorScroller || target < 1) return;

	void tick().then(() => {
		indicatorScroller
			?.querySelector<HTMLElement>(`[data-sample-number="${target}"]`)
			?.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "nearest",
			});
	});
});

function sampleStatus(
	number: number,
	isReceived: boolean,
	isComplete: boolean,
	isCurrent: boolean,
): string {
	const key = isReceived
		? "TEACHABLE_MACHINE_SAMPLE_RECEIVED"
		: isComplete
			? "TEACHABLE_MACHINE_SAMPLE_RECORDED"
			: isCurrent
				? "TEACHABLE_MACHINE_SAMPLE_RECORDING"
				: "TEACHABLE_MACHINE_SAMPLE_WAITING";
	return $_(key, { values: { number } });
}
</script>

<div class="flex w-full min-w-0 flex-col gap-2 rounded-xl bg-bg px-3 py-2.5 shadow-sm">
	<div bind:this={indicatorScroller} class="w-full overflow-x-auto overscroll-x-contain scroll-smooth pb-1">
		<div class="relative flex w-max min-w-full items-center justify-between gap-1.5">
			<div class="absolute left-4 right-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-secondary"></div>
			{#each Array(total) as _, index}
				{@const number = index + 1}
				{@const isReceived = number <= received}
				{@const isComplete = isReceived || (current > 0 && number < current)}
				{@const isCurrent = number === current && !isReceived}
				<div
					class="relative z-10 grid size-9 shrink-0 place-items-center rounded-full bg-bg text-xs font-bold
						{isComplete ? 'bg-accent! text-on-accent' : ''}
						{isCurrent ? 'text-accent' : 'text-on-secondary-muted'}"
					aria-label={sampleStatus(number, isReceived, isComplete, isCurrent)}
					data-sample-number={number}
				>
					{#if isCurrent}
						<svg class="absolute inset-0 size-9 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
							<circle class="fill-none stroke-secondary stroke-[3]" cx="18" cy="18" r="15"></circle>
							<circle
								class="fill-none stroke-accent stroke-[3] transition-[stroke-dashoffset] duration-75"
								cx="18"
								cy="18"
								r="15"
								stroke-dasharray={circumference}
								stroke-dashoffset={circumference * (1 - progress)}
							></circle>
						</svg>
					{/if}
					<span class="relative">{#if isComplete}<Fa icon={faCheck} />{:else}{number}{/if}</span>
				</div>
			{/each}
		</div>
	</div>
	<div class="flex items-center justify-between gap-2 text-xs">
		<strong class="text-accent">{message}</strong>
		<span class="shrink-0 text-on-secondary-muted">{$_("TEACHABLE_MACHINE_RECEIVED_COUNT", { values: { received, total } })}</span>
	</div>
</div>
