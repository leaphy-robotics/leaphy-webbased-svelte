<script lang="ts">
import type { Class } from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import { _ } from "svelte-i18n";

interface Props {
	classData: Class;
}
let { classData }: Props = $props();

let binding = $state(false);

function assign() {
	binding = true;
}

function onKey(e: KeyboardEvent) {
	if (!binding) return;

	classData.key = e.code;
	binding = false;
}

function abort() {
	if (!binding) return;

	binding = false;
}

function getKeyLabel(key: string): [string, Record<string, string>] | [string] {
	if (!key) return ['UNASSIGNED'];
	if (key.startsWith("Key")) {
		return ['KEY', { key: key.slice(3) }]
	}
	if (key.startsWith("Digit")) {
		return ['DIGIT', { key: key.slice(5) }]
	}
	
	return [key.toUpperCase()]
}

let label = $derived(getKeyLabel(classData.key));
let translation = $derived(label[0]);
let values = $derived(label[1]);
</script>

<svelte:document onkeyup={onKey} onmousedown={abort} />
<button onclick={assign} class="key" class:active={binding}>{binding ? $_("PRESS_ANY_KEY") : $_(translation, { values })}</button>

<style>
	.key {
		background: var(--background);
		border: none;
		padding: 5px;
		border-radius: 5px;
	}
</style>
