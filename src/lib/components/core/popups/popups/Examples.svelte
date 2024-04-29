<script lang="ts">
    import { _ } from "svelte-i18n";
    import Windowed from "../Windowed.svelte";
    import { inFilter } from "$domain/robots";
    import workspaceState from "$state/workspace.svelte"
    import { getContext, onMount } from "svelte";
    import { workspace } from "$state/blockly.svelte";
    import { serialization } from "blockly";
    import { type Writable } from "svelte/store";
    import { type PopupState, popups } from "$state/popup.svelte";

    interface Example {
        name: string,
        icon: string,
        sketch: () => Promise<{ default: Record<string, any> }>,
        boards: number[]
    }

    let examples = $state<Example[]>([])
    let visible = $derived(examples.filter(({ boards }) => inFilter(workspaceState.robot, boards)))

    async function getExamples() {
        examples = await Promise.all(
            Object.values(import.meta.glob('$examples/*.ts'))
                .map(async (module: () => Promise<{ default: Example}>) => {
                    const example = await module()
                    return example.default
                })
        )
    }
    onMount(getExamples)

    const popupState = getContext<Writable<PopupState>>('state')
    async function loadExample(example: Example) {
        popups.close($popupState.id)
        const sketch = await example.sketch()
        serialization.workspaces.load(sketch.default, $workspace)
    }
</script>

{#snippet content()}
    <div class="content">
        {#each visible as example}
            <button class="example" onclick={() => loadExample(example)}>
                <img class="icon" src={example.icon} alt="">
                <div class="name">{example.name}</div>
            </button>
        {/each}
    </div>
{/snippet}
<Windowed title={$_("EXAMPLES")} {content} />

<style>
    .content {
        width: 800px;
        padding: 10px;
        gap: 10px;
        display: grid;
        grid-template-columns: repeat(auto-fill,minmax(100px,1fr));
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
        transition: .3s ease;
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
