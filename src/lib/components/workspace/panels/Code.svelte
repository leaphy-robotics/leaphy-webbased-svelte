<script lang="ts">
import CodeEditor from "$components/ui/CodeEditor.svelte";
import WorkspaceState from "$state/workspace.svelte";
</script>

<CodeEditor value={WorkspaceState.code} editable={false} language="cpp" />
