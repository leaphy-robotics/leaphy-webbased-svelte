<script lang="ts">
    import tutorials, {
        type Tutorial,
        type TutorialItem,
    } from "$education/tutorials";
    import { _, locale } from "svelte-i18n";
    import { faPlay, faList, faVideo } from "@fortawesome/free-solid-svg-icons";
    import FontAwesomeIcon from "svelte-fa";
    import Thumbnail from "../tutorials/Thumbnail.svelte";
    import PopupsState, { Anchor } from "$state/popup.svelte";
    import Tutorials from "../tutorials/Tutorials.svelte";
    import { getContext } from "svelte";
    import { type PopupState } from "$state/popup.svelte";

    let popupState = getContext<PopupState>("state");

    function openTutorial(tutorial: Tutorial) {
        PopupsState.open({
            component: Tutorials,
            data: { initialTutorial: tutorial },
            allowInteraction: true,
            allowOverflow: true,
            position: {
                x: (window.innerWidth / 2) - 320,
                y: (window.innerHeight / 2) - 210,
            },
        });
        popupState.close();
    }
</script>

<div class="tutorials">
    {#each tutorials[$locale] as tutorial}
        <div class="tutorial">
            <Thumbnail name={tutorial.name} item={tutorial.item} onclick={() => openTutorial(tutorial)} />
        </div>
    {/each}
</div>

<style>
    .tutorials {
        display: flex;
        flex-wrap: nowrap;
        gap: 10px;
        overflow-x: auto;
        width: 378px;
    }

    .tutorial {
        width: 278px;
        flex-shrink: 0;
    }
    
</style>
