<script lang="ts" module>
export type StepState = "todo" | "active" | "done" | "locked";
</script>

<script lang="ts">
import { faCheck, faLock } from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";


interface Props {
	number: number;
	state: StepState;
	compact?: boolean;
}
const { number, state, compact = false }: Props = $props();

const stateClasses: Record<StepState, string> = {
	todo: "bg-secondary text-on-secondary",
	active: "bg-primary text-on-primary",
	done: "bg-success text-white",
	locked: "bg-secondary text-on-secondary-muted",
};
</script>

<span class="grid shrink-0 place-items-center rounded-full font-extrabold {compact ? 'size-7 text-sm' : 'size-9'} {stateClasses[state]}">
	{#if state === "done"}
		<Fa icon={faCheck} />
	{:else if state === "locked"}
		<Fa icon={faLock} />
	{:else}
		{number}
	{/if}
</span>
