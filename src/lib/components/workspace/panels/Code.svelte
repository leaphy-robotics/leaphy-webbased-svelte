<script lang="ts">
import CodeEditor from "$components/ui/CodeEditor.svelte";
import { code } from "$state/workspace.svelte";
</script>

<CodeEditor value={$code} editable={false} />
