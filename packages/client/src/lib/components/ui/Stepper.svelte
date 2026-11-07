<script lang="ts" module>
export interface StepperStep {
	title: string;
	done?: boolean;
	locked?: boolean;
	// Explains why the step is locked
	reason?: string;
}
</script>

<script lang="ts">
import StepNumber, { type StepState } from "$components/ui/StepNumber.svelte";


interface Props {
	steps: StepperStep[];
	current: number;
	onselect?: (index: number) => void;
}
const { steps, current, onselect }: Props = $props();

function getState(step: StepperStep, index: number): StepState {
	if (index === current) return "active";
	if (step.locked) return "locked";
	if (step.done) return "done";
	return "todo";
}
</script>

<ol class="m-0 flex w-full list-none items-center gap-2 p-0">
	{#each steps as step, index}
		<li class="flex min-w-0 flex-1 items-center gap-2 last:flex-none">
			<button
				type="button"
				class="flex min-w-0 items-center gap-2 rounded-full border-none bg-transparent p-1 pr-3 text-left text-sm text-on-bg
					{step.locked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-bg-tint'}"
				disabled={step.locked}
				title={step.locked ? step.reason : undefined}
				aria-current={index === current ? "step" : undefined}
				onclick={() => onselect?.(index)}
			>
				<StepNumber compact number={index + 1} state={getState(step, index)} />
				<span class="truncate {index === current ? 'font-bold' : step.locked ? 'text-on-secondary-muted' : ''}">{step.title}</span>
			</button>
			{#if index < steps.length - 1}
				<span class="h-0.5 min-w-4 flex-1 rounded-full {step.done ? 'bg-success' : 'bg-secondary'}"></span>
			{/if}
		</li>
	{/each}
</ol>
