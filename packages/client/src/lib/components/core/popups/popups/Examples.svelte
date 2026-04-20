<script lang="ts">
import { serialization } from "blockly";
import { getContext, onMount } from "svelte";
import { _ } from "svelte-i18n";
import { inFilter } from "$domain/robots";
import BlocklyState from "$state/blockly.svelte";
import type { PopupState } from "$state/popup.svelte";
import WorkspaceState from "$state/workspace.svelte";
import Windowed from "../Windowed.svelte";

interface Example {
	name: string;
	icon: string;
	sketch: () => Promise<{ default: Record<string, any> }>;
	boards: number[];
}

let examples = $state<Example[]>([]);
const visible = $derived(
	examples.filter(({ boards }) => inFilter(WorkspaceState.robot, boards)),
);

async function getExamples() {
	examples = await Promise.all(
		Object.values(import.meta.glob("$education/examples/*.ts")).map(
			async (module: () => Promise<{ default: Example }>) => {
				const example = await module();
				return example.default;
			},
		),
	);
}
onMount(getExamples);

const popupState = getContext<PopupState>("state");
async function loadExample(example: Example) {
	popupState.close();
	const sketch = await example.sketch();
	serialization.workspaces.load(sketch.default, BlocklyState.workspace);
}
</script>

<Windowed title={$_("EXAMPLES")}>
	<div class="w-[800px] bg-bg-tint p-3 grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3">
		{#each visible as example}
			<button
				class="group flex flex-col items-center gap-2 p-0 border-none bg-transparent text-on-bg cursor-pointer transition-transform hover:scale-[1.03]"
				onclick={() => loadExample(example)}
			>
				<span class="flex justify-center items-center shadow-sm border border-bg-tint bg-robot aspect-square w-full rounded-lg transition-all
					group-hover:border-2 group-hover:border-primary">
					<img class="max-w-[80%] max-h-[80%] object-contain" src={example.icon} alt="" />
				</span>
				<span class="text-sm">{example.name}</span>
			</button>
		{/each}
	</div>
</Windowed>
