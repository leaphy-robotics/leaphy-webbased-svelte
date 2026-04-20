<script lang="ts">
import ComponentRenderer from "$components/ui/ComponentRenderer.svelte";
import WorkspaceState from "$state/workspace.svelte";
import { onDestroy, onMount } from "svelte";

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

<div class="flex pointer-events-auto" style:width={`${width}px`}>
	<div
		class="relative border-l-2 border-text-muted h-full cursor-w-resize before:content-[''] before:absolute before:w-5 before:h-full before:-left-2.5 before:top-0"
		onmousedown={mousedown}
	></div>
	<ComponentRenderer component={WorkspaceState.SidePanel} />
</div>
