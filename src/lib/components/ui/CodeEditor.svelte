<script lang="ts">
import AppState, { Theme } from "$state/app.svelte";
import * as monaco from "monaco-editor";
import { onMount } from "svelte";

interface Props {
	value: string;
	language: string;
	editable?: boolean;
}
let { value = $bindable(""), editable = true, language }: Props = $props();

let updating = false;
let ignoreUpdate = false;
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
		if (updating) updating = false;
		else ignoreUpdate = true;

		value = editor.getValue();
	});
});

$effect(() => {
	monaco.editor.setTheme(AppState.theme === Theme.DARK ? "vs-dark" : "vs-light");
})

$effect(() => {
	const newContent = value; // marks value as dependency, do not remove
	if (ignoreUpdate || !editor) {
		ignoreUpdate = false;
		return;
	}

	updating = true;
	editor.getModel().setValue(newContent as string);
});
</script>

<div class="editor" bind:this={element}></div>

<style>
    .editor {
        width: 100%;
        height: 100%;
    }
</style>
