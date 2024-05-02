<script lang="ts">
    import CodeEditor from "$components/ui/CodeEditor.svelte";
    import { code } from "$state/workspace.svelte";
</script>



<div class="environment">
    <CodeEditor bind:value={$code} />
</div>

<style>
    .environment {
        height: var(--full-height);
        position: relative;
    }
</style>
