<script lang="ts">
    import { onMount, type Bindable } from "svelte";
    import * as monaco from 'monaco-editor'
    import { Theme, theme } from "$state/app.svelte";

    interface Props {
        value: Bindable<string>
        editable?: boolean
    }
    let { value = $bindable(""), editable = true }: Props = $props()

    let ignoreUpdate = false
    let element: HTMLDivElement
    let editor: monaco.editor.IStandaloneCodeEditor
    onMount(() => {
        editor = monaco.editor.create(element, {
            theme: $theme === Theme.DARK ? 'vs-dark' : 'vs-light',
            language: 'cpp',
            value: value as string,
            automaticLayout: true,
            readOnly: !editable
        })
        editor.getModel().onDidChangeContent(() => {
            ignoreUpdate = true
            value = editor.getValue()
        })
    })

    theme.subscribe(theme => {
        if (!editor) return
        monaco.editor.setTheme(theme === Theme.DARK ? 'vs-dark' : 'vs-light')
    })

    $effect(() => {
        const newContent = value // marks value as dependency, do not remove
        if (ignoreUpdate || !editor) { 
            ignoreUpdate = false
            return 
        }

        editor.getModel().setValue(newContent as string)
    })
</script>

<div class="editor" bind:this={element}></div>

<style>
    .editor {
        width: 100%;
        height: 100%;
    }
</style>
