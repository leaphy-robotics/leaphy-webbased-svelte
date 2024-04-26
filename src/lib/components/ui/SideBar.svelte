<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        buttons: Snippet
    }
    let { buttons }: Props = $props()
</script>

<div class="sidebar">
    {@render buttons()}
</div>

<style>
    .sidebar {
        display: flex;
        flex-direction: column;
        gap: 50px;
        padding: 20px;
        position: absolute;
        top: 0;
        right: 0;
    }
</style>
