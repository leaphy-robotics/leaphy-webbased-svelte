<script lang="ts">
import AppState, { Theme } from "$state/app.svelte";
import { track } from "$state/utils";
import * as monaco from "monaco-editor";
import { onMount } from "svelte";

interface Props {
	value: string;
	language: string;
	editable?: boolean;
}
let { value = $bindable(""), editable = true, language }: Props = $props();

let element: HTMLDivElement;
let editor: monaco.editor.IStandaloneCodeEditor;
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

<div class="editor" bind:this={element}></div>

<style>
    .editor {
        width: 100%;
        height: 100%;
    }
</style>
