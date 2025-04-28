<script lang="ts">
import CodeEditor from "$components/ui/CodeEditor.svelte";
import WorkspaceState from "$state/workspace.svelte";
</script>

<div class="environment">
    <CodeEditor bind:value={WorkspaceState.code} language="cpp" />
</div>

<style>
    .environment {
        height: var(--full-height);
        position: relative;
    }
</style>
