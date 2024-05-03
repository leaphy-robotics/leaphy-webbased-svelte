<script lang="ts">
    import CodeEditor from "$components/ui/CodeEditor.svelte";
    import { onDestroy, onMount } from "svelte";
    import { sidePanel } from "$state/workspace.svelte";

    let width = $state(300);

    let x: number, dragging: boolean, initial: number;
    function mousedown(event: MouseEvent) {
        x = event.pageX;
        initial = width;
        dragging = true;
    }

    function mousemove(event: MouseEvent) {
        if (!dragging) return;
        width = initial - (event.pageX - x);
    }

    function mouseup() {
        dragging = false;
    }

    onMount(() => {
        document.body.addEventListener("mousemove", mousemove);
        document.body.addEventListener("mouseup", mouseup);
    });
    onDestroy(() => {
        document.body.removeEventListener("mousemove", mousemove);
        document.body.removeEventListener("mouseup", mouseup);
    });
</script>

<div class="panel" style:width={`${width}px`}>
    <div class="dragger" onmousedown={mousedown}></div>
    <svelte:component this={$sidePanel} />
</div>

<style>
    .panel {
        display: flex;
    }
    .dragger {
        position: relative;
        border-left: 3px solid var(--text-muted);
        height: 100%;
        cursor: w-resize;
    }
    .dragger::before {
        content: "";
        position: absolute;
        width: 20px;
        height: 100%;
        left: -10px;
        top: 0;
    }
</style>
