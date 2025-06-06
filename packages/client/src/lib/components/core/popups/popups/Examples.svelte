<script lang="ts">
import { inFilter } from "$domain/robots";
import BlocklyState from "$state/blockly.svelte";
import type { PopupState } from "$state/popup.svelte";
import WorkspaceState from "$state/workspace.svelte";
import { serialization } from "blockly";
import { getContext, onMount } from "svelte";
import { _ } from "svelte-i18n";
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
	<div class="content">
		{#each visible as example}
			<button class="example" onclick={() => loadExample(example)}>
				<img class="icon" src={example.icon} alt="" />
				<span class="name">{example.name}</span>
			</button>
		{/each}
	</div>
</Windowed>

<style>
    .content {
        width: 800px;
        padding: 10px;
        gap: 10px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }

    .example {
        aspect-ratio: 1/1;
        cursor: pointer;
        border: 3px solid var(--secondary);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        justify-content: end;
        align-items: center;
        gap: 5px;
        padding: 10px;
        transition: 0.3s ease;
        background: none;
        color: var(--on-background);
    }
    .example:hover {
        border: 3px solid var(--primary);
    }

    .icon {
        flex: 1;
        max-width: 100%;
        max-height: calc(100% - 29px);
    }
</style>
