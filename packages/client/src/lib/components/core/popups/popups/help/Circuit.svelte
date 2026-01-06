<script lang="ts">
    import { track } from "$state/utils";
    import WorkspaceState from "$state/workspace.svelte";
	import { faMagnifyingGlassPlus } from "@fortawesome/free-solid-svg-icons";
    import { arduino } from "@leaphy-robotics/leaphy-blocks";
    import { layoutComponents } from "@leaphy-robotics/schemas";
	import Fa from "svelte-fa";
	import PopupsState, { type PopupState } from "$state/popup.svelte";
	import { getContext } from "svelte";
	import Circuit from "../Circuit.svelte";
	import { _ } from "svelte-i18n";
    
    let popupState = getContext<PopupState>("state");

    const canvas = document.createElement("canvas");
    let image = $state<string>();
    $effect(() => {
        track(WorkspaceState.code);
        layoutComponents(canvas, arduino.builder).then(() => {
            image = canvas.toDataURL();
        });
    });

    function zoomIn() {
        PopupsState.open({
            component: Circuit,
            data: {},
            allowInteraction: true,
        });
        popupState.close();
    }
</script>

<div class="container">
    <div class="content" onclick={zoomIn}>
        <img src={image} alt="Circuit" />
        <div class="overlay">
            <div class="overlay-content">
                <div class="overlay-content-icon">
                    <Fa icon={faMagnifyingGlassPlus} />
                </div>
                <div class="overlay-content-text">Click to zoom in</div>
            </div>
        </div>
    </div>
    <div class="description">{$_("CIRCUIT_DESCRIPTION")}</div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1;
    }

    .content {
        position: relative;
        flex: 1;
        cursor: pointer;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .overlay {
        position: absolute;
        inset: 0;
        background: #00000060;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        z-index: 1;
        color: #fff;
        border-radius: 10px;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
    }

    .content:hover .overlay {
        opacity: 1;
    }

    .overlay-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .overlay-content-icon {
        font-size: 40px;
    }
</style>
