<script lang="ts">
import type { PopupState } from "$state/popup.svelte";
import { setContext } from "svelte";
import { writable } from "svelte/store";
import Windowed from "./Windowed.svelte";

interface Props {
	state: PopupState;
}
const { state: popupState }: Props = $props();

const internalState = writable(popupState);
setContext("state", internalState);

$effect(() => {
	internalState.update(() => popupState);
});
</script>

<div class="container" class:full={!popupState.popup.allowInteraction}>
    <div class="localRoot">
        <div
            class="popup"
            style:left={`${popupState.position.x}px`}
            style:top={`${popupState.position.y}px`}
        >
            <svelte:component
                this={popupState.popup.component}
                {...popupState.popup.data}
            />
        </div>
    </div>
</div>

<style>
    .popup {
        position: absolute;
        translate: -50% -50%;
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
