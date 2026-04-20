<script lang="ts">
import * as monaco from "monaco-editor";
import { onMount } from "svelte";
import AppState, { Theme } from "$state/app.svelte";
import { track } from "$state/utils";

interface Props {
	value: string;
	language: string;
	editable?: boolean;
	editor?: monaco.editor.IStandaloneCodeEditor;
}
let {
	value = $bindable(""),
	editor = $bindable(),
	editable = true,
	language,
}: Props = $props();

let element: HTMLDivElement;
onMount(() => {
	editor = monaco.editor.create(element, {
		theme: AppState.theme === Theme.DARK ? "vs-dark" : "vs-light",
		language,
		value: value as string,
		automaticLayout: true,
		readOnly: !editable,
	});
	editor.getModel().onDidChangeContent(() => {
		if (value === editor.getValue()) return;

		value = editor.getValue();
	});
});

$effect(() => {
	monaco.editor.setTheme(
		AppState.theme === Theme.DARK ? "vs-dark" : "vs-light",
	);
});

$effect(() => {
	track(value);

	if (editor.getValue() === value) return;
	editor.getModel().setValue(value);
});
</script>

<div class="w-full h-full" bind:this={element}></div>
