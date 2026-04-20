<script lang="ts">
import { setContext } from "svelte";
import type { PopupState } from "$state/popup.svelte";

interface Props {
	state: PopupState;
}
const { state }: Props = $props();

setContext("state", state);
</script>

<div class="{!state.allowInteraction ? 'flex fixed left-0 top-0 w-screen h-screen bg-black/[0.12]' : ''}">
	<div class="fixed left-1/2 top-1/2">
		<div
			class="absolute bg-bg rounded-xl shadow-[var(--shadow-el2)]
				{state.allowOverflow ? 'overflow-visible' : 'overflow-hidden'}"
			style:translate="{state.anchor}"
			style:left={`${state.position.x}px`}
			style:top={`${state.position.y}px`}
		>
			<state.component {...state.data} />
		</div>
	</div>
</div>
