<script lang="ts">
    import { faPlay, faVideo, faList } from "@fortawesome/free-solid-svg-icons";
    import FontAwesomeIcon from "svelte-fa";
    import type { TutorialItem } from "$education/tutorials";

    interface Props {
        name: string;
        item: TutorialItem[] | string;
        onclick: () => void;
    }
    let { name, item, onclick }: Props = $props();

    function getThumbnail(item: TutorialItem[] | string) {
        if (typeof item === "string") {
            return `https://img.youtube.com/vi/${item}/0.jpg`;
        }
        return `https://img.youtube.com/vi/${item[0].video}/0.jpg`;
    }
</script>

<div class="tutorial" onclick={onclick}>
    <div class="thumbnail">
        <img src={getThumbnail(item)} alt={name} />
        <div class="play">
            <FontAwesomeIcon icon={faPlay} />
        </div>
    </div>
    <span class="name"><FontAwesomeIcon icon={typeof item === "string" ? faVideo : faList} /> {name}</span>
</div>

<style>
    .tutorial {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .tutorial img {
        width: 100%;
        aspect-ratio: 1920 / 1080;
        background: var(--secondary);
        object-fit: cover;
    }

    .tutorial span {
        font-size: 14px;
        font-weight: bold;
        text-wrap: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .thumbnail {
        position: relative;
        overflow: hidden;
        border-radius: 10px;
        line-height: 0;
    }

    .play {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        inset: 0;

        background: #00000060;
        cursor: pointer;
        color: #fff;
        font-size: 40px;
    }
</style>