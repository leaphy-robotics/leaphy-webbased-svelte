<script lang="ts">
    import CodeEditor from "$components/ui/CodeEditor.svelte";
    import { code } from "$state/workspace.svelte";
    import Terminal from "./Terminal.svelte";
</script>



<div class="environment">
    <div class="editor">
        <CodeEditor bind:value={$code} />
    </div>
    <Terminal />
</div>

<style>
    .environment {
        display: flex;
        flex-direction: column;
        height: var(--full-height);
        position: relative;
    }
    .editor {
        flex: 1;
    }
</style>
