<script lang="ts">
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import type { Snippet } from "svelte";
import Fa from "svelte-fa";

interface Props {
	children: Snippet;
	title?: string;
	icon?: IconDefinition;
}
let { children, title, icon }: Props = $props();
</script>

<div class="container">
    {#if title}
        <div class="title">
            <Fa icon={icon} />
            {title}
        </div>
    {/if}
    {@render children()}
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
        background: var(--background);
        border-radius: 10px;
        border: 1px solid var(--secondary);
    }

    .title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 20px;
        font-weight: bold;
    }
</style>
