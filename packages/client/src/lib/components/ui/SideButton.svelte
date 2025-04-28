<script lang="ts">
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";

interface Props {
	icon: IconDefinition;
	action: string;
	onclick: () => void;
}
const { icon, action, onclick }: Props = $props();
</script>

<button class="side" {onclick}>
    <div class="tooltip">{$_(action)}</div>
    <Fa {icon} />
</button>

<style>
    .tooltip {
        position: absolute;
        right: 100%;
        margin-right: 15px;
        background: var(--secondary);
        color: var(--on-secondary);
        padding: 10px;
        border-radius: 5px;
        font-size: 14px;
        pointer-events: none;
        filter: opacity(0);
        transition: .3s ease;
        width: 100px;
    }

    .side:hover .tooltip {
        filter: opacity(1);
    }

    .side {
        position: relative;
        cursor: pointer;
        font-size: 20px;
        height: 66px;
        width: 66px;
        border: none;
        border-radius: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--primary);
        color: var(--on-primary);
        pointer-events: auto;
    }
</style>
