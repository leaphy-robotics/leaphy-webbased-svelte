<script lang="ts">
import type { Snippet } from "svelte";

interface Props {
	children: Snippet;
}
const { children }: Props = $props();
</script>

<div class="sidebar">
    {@render children()}
</div>

<style>
    .sidebar {
        display: flex;
        flex-direction: column;
        gap: 50px;
        padding: 20px;
    }
</style>
