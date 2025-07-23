<script lang="ts">
import type { Class } from "@leaphy-robotics/leaphy-blocks/src/categories/ml";

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
</script>

<svelte:document onkeypress={onKey} onmousedown={abort} />
<button onclick={assign} class="key" class:active={binding}>{binding ? 'Press any key' : classData.key || 'Unassigned'}</button>

<style>
	.key {
		background: var(--background);
		border: none;
		padding: 5px;
		border-radius: 5px;
	}
</style>
