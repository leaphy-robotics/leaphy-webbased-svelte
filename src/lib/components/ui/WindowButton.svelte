<script lang="ts">
    import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa"

    interface Props {
      onclick: () => void,
      icon: IconDefinition
    }
    let { onclick, icon }: Props = $props()
</script>

<button class="window-btn" {onclick}>
    <Fa {icon} />
</button>

<style>
    .window-btn {
        aspect-ratio: 1/1;
        width: 33px;
        background: none;
        border: 1px solid var(--primary-dark-tint);
        border-radius: 6px;
        color: var(--on-primary);
    }
</style>
