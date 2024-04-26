<script lang="ts">
    import CodeEditor from "$components/ui/CodeEditor.svelte";
    import workspaceState from "$state/workspace.svelte"
</script>

<CodeEditor value={workspaceState.code} editable={false} />
