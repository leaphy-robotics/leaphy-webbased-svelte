<script lang="ts">
import { computePosition } from "@floating-ui/dom";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { tick } from "svelte";
import Fa from "svelte-fa";

interface Props {
	options: [string, any][];
	value: any;
}
let { options, value = $bindable() }: Props = $props();

const preview: HTMLButtonElement = $state();
const content: HTMLDivElement = $state();

let open = $state(false);
let position = $state<{ x: number; y: number }>({ x: 0, y: 0 });

function getName(value: any) {
	return options.find(([_, data]) => data === value)[0];
}

async function onclick() {
	open = !open;
	if (!open) return;
	await tick();

	position = await computePosition(preview, content);
}

function select(newValue: string) {
	open = false;
	value = newValue;
}
</script>

<div class="select">
    <button {onclick} class:open bind:this={preview} class="preview">
        <div class="name">{getName(value)}</div>
        <div class="icon"><Fa icon={faCaretDown} /></div>
    </button>
    {#if open}
        <div bind:this={content} class="popup">
            <div class="container">
                {#each options as option (option[1])}
                    <button onclick={() => select(option[1])} class="option"
                        >{option[0]}</button
                    >
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .preview {
        width: 150px;
    }
    .preview,
    .option {
        position: relative;
        background: var(--primary-dark-tint);
        color: var(--on-primary);
        border: none;
        padding: 10px 15px;
        border-radius: 20px;
    }
    .icon {
        position: absolute;
        right: 15px;
        top: 50%;
        translate: 0 -50%;
    }
    .open {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }

    .popup {
        width: 150px;
        position: fixed;
        z-index: 99;
        border-radius: 20px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        overflow: hidden;
        box-shadow: var(--shadow-el1);
    }

    .container {
        overflow-y: auto;
        max-height: 200px;

        display: flex;
        flex-direction: column;
    }

    .option {
        background: var(--primary);
        border-radius: 0;
        text-overflow: ellipsis;
    }
</style>
