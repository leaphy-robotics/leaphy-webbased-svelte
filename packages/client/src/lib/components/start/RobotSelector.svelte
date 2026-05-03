<script lang="ts">
import type { Robot } from "$domain/robots";
import SerialState from "$state/serial.svelte";

interface Props {
	robots: Robot[][];
	onselect: (robot: Robot) => void;
	compact?: boolean;
	selected?: Robot;
}

const { robots, onselect, compact = false, selected }: Props = $props();
</script>

<div class="flex flex-col justify-center items-center h-full {compact ? '' : 'w-[50vw]'}">
	<div class="flex flex-col gap-[3vh]">
		{#each robots as row}
			<div class="flex justify-center gap-6">
				{#each row as robot}
					<button
						class="group w-[12vw] max-w-[180px] cursor-pointer border-none bg-transparent text-on-bg transition-transform hover:scale-[1.03]"
						onclick={() => onselect(robot)}
					>
						<span class="flex justify-center items-center shadow-sm border border-bg-tint bg-robot aspect-square w-full rounded-lg transition-all mb-[1vh]
							{robot.id === selected?.id || ('board' in robot && SerialState.board?.id === robot.board) ? 'border-2 border-primary' : 'group-hover:border-2 group-hover:border-primary'}">
							<img class="max-w-[90%] max-h-[90%]" src={robot.icon} alt={robot.name}/>
						</span>
						<span class="text-[1rem]">{robot.name}</span>
					</button>
				{/each}
			</div>
		{/each}
	</div>
</div>
