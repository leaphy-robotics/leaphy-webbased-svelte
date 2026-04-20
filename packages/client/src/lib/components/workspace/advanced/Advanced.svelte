<script lang="ts">
import CodeEditor from "$components/ui/CodeEditor.svelte";
import WorkspaceState from "$state/workspace.svelte";
</script>

<div class="h-[var(--full-height)] relative">
    <CodeEditor bind:value={WorkspaceState.code} language="cpp" />
</div>
