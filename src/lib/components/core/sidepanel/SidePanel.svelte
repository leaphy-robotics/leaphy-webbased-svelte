<script lang="ts">
import WorkspaceState from "$state/workspace.svelte";
import { onDestroy, onMount } from "svelte";
import ComponentRenderer from "$components/ui/ComponentRenderer.svelte";

let width = $state(300);

let x: number;
let dragging: boolean;
let initial: number;
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
    <ComponentRenderer component={WorkspaceState.SidePanel} />
</div>

<style>
    .panel {
        display: flex;
        pointer-events: auto;
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
