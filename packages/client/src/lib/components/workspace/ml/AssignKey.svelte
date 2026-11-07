<script lang="ts">
import {
	type Class,
	ml,
} from "@leaphy-robotics/leaphy-blocks/src/categories/ml";
import { _ } from "svelte-i18n";

interface Props {
	classData: Class;
}
let { classData }: Props = $props();

let binding = $state(false);
let key = $state<string>(classData.key);

function assign() {
	binding = true;
}

function onKey(e: KeyboardEvent) {
	if (!binding) return;

	key = e.code;
	ml.classes.setKey(classData.id, e.code);
	binding = false;
}

function abort() {
	if (!binding) return;

	binding = false;
}

function getKeyLabel(key: string): [string, Record<string, string>] | [string] {
	if (!key) return ["UNASSIGNED"];
	if (key.startsWith("Key")) {
		return ["KEY", { key: key.slice(3) }];
	}
	if (key.startsWith("Digit")) {
		return ["DIGIT", { key: key.slice(5) }];
	}

	return [key.toUpperCase()];
}

let label = $derived(getKeyLabel(key));
let translation = $derived(label[0]);
let values = $derived(label[1]);
</script>

<svelte:document onkeyup={onKey} onmousedown={abort} />
<button
	onclick={assign}
	class="min-w-24 cursor-pointer rounded-md border-2 px-2.5 py-1.5 font-mono text-sm
		{binding ? 'border-primary bg-bg animate-pulse' : key ? 'border-secondary bg-bg' : 'border-dashed border-primary bg-bg text-primary'}"
	aria-label={$_("ML_ASSIGN_KEY", { values: { name: classData.name } })}
>{binding ? $_("PRESS_ANY_KEY") : $_(translation, { values, default: key })}</button>
