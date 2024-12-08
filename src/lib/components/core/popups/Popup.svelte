<script lang="ts">
import type { PopupState } from "$state/popup.svelte";
import { setContext } from "svelte";

interface Props {
	state: PopupState;
}
const { state }: Props = $props();

setContext("state", state);
</script>

<div class="container" class:full={!state.allowInteraction}>
    <div class="localRoot">
        <div
            class="popup"
			style:translate="{state.anchor}"
            style:left={`${state.position.x}px`}
            style:top={`${state.position.y}px`}
        >
			<state.component {...state.data} />
        </div>
    </div>
</div>

<style>
    .popup {
        position: absolute;
        background: var(--background);
        border-radius: 6px;
        overflow: hidden;
        box-shadow: var(--shadow-el2);
    }

    .full {
        display: flex;
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background: #00000020;
    }

    .localRoot {
        position: fixed;
        left: 50%;
        top: 50%;
    }
</style>
