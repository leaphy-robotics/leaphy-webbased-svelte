<script lang="ts">
    import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";

    interface Props {
        icon: IconDefinition,
        name: string,
        onclick: () => void,
        disabled?: boolean
    }
    let { icon, name, onclick, disabled = false }: Props = $props()
</script>

<tr class="item" {onclick} class:disabled={disabled}>
    <td class="icon"><Fa {icon} /></td>
    <td class="name">{name}</td>
</tr>

<style>
    .item {
        background: var(--background);
    }
    .item:hover {
        background: var(--background-tint);
    }

    .icon {
        padding: 10px 10px 10px 20px;;
        color: var(--primary-dark-tint);
        text-align: center;
    }

    .name {
        padding: 0 30px 0 0;
    }

    .disabled {
        background: var(--background) !important;
        opacity: 0.5;
    }
</style>
