<script lang="ts">
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";

interface Props {
	icon: IconDefinition;
	onclick: () => void;
}
const { icon, onclick }: Props = $props();
</script>

<button class="side" {onclick}>
    <Fa {icon} />
</button>

<style>
    .side {
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
