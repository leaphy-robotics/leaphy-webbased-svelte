<script lang="ts">
    import { onDestroy, onMount, setContext, type Snippet } from "svelte";
    import ContextMenu from "./ContextMenu.svelte";
    import { writable } from "svelte/store";

    interface Props {
        name: string,
        onclick?: () => void,
        context?: Snippet,
        mode: "primary"|"secondary"|"outlined"|"accent",
        bold?: boolean
    }
    let { name, mode, onclick = onContext, context, bold }: Props = $props()

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
    class:bold={bold}
>
    {name}
</button>

<style>
    .btn {
        cursor: pointer;
        border-radius: 20px;
        background: none;
        border: none;
        padding: 10px 15px;
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
        border: 1px solid var(--accent);
        color: var(--on-primary);
    }
    .accent {
        background: var(--accent);
        color: var(--on-accent);
    }
    .bold {
        font-weight: bolder;
        font-size: 1.1em;
    }
</style>
