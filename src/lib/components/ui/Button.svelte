<script lang="ts">
    import { onDestroy, onMount, setContext, type Snippet } from "svelte";
    import ContextMenu from "./ContextMenu.svelte";
    import { writable } from "svelte/store";

    interface Props {
        name: string,
        onclick?: () => void,
        context?: Snippet,
        mode: "primary"|"secondary"|"outlined"|"accent"
    }
    let { name, mode, onclick = onContext, context }: Props = $props()

    let btn: HTMLButtonElement = $state()

    const open = setContext('open', writable(false))
    function onContext() {
        if (!context) return

        open.update(() => true)
    }
</script>

{#if $open}
    <ContextMenu source={btn} content={context} />
{/if}

<button 
    bind:this={btn}
    {onclick} 
    type="button"
    class="btn"
    class:primary={mode === 'primary'} 
    class:secondary={mode === 'secondary'} 
    class:outlined={mode === 'outlined'}
    class:accent={mode === 'accent'}
>
    {name}
</button>

<style>
    .btn {
        cursor: pointer;
        border-radius: 20px;
        background: none;
        border: none;
        height: 30px;
        padding: 0px 20px;
    }

    .primary {
        background: var(--primary);
        color: var(--on-primary);
    }
    .secondary {
        background: var(--secondary);
        color: var(--on-secondary);
    }
    .outlined {
        border: 1px solid var(--primary-dark-tint);
        color: var(--on-primary);
    }
    .accent {
        background: var(--accent);
        color: var(--on-accent);
    }
</style>
