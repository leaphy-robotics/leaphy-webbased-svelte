<script lang="ts">
    import { _ } from "svelte-i18n";
    import Button from "$components/ui/Button.svelte";
    import { getContext } from "svelte";
    import { popups, type PopupState } from "$state/popup.svelte";
    import type { Writable } from "svelte/store";

    interface Props {
        title: string,
        message: string
    }
    let { title, message }: Props = $props()

    let popupState = getContext<Writable<PopupState>>("state")
    function cancel() {
        popups.close($popupState.id, false)
    }
    function ok() {
        popups.close($popupState.id, true)
    }
</script>

<div class="content">
    <h2>{$_(title)}</h2>
    <div class="text">{$_(message)}</div>
    <div class="actions">
        <Button name={$_("CANCEL")} mode={"secondary"} onclick={cancel} />
        <Button name={$_("OK")} mode={"primary"} onclick={ok} />
    </div>
</div>

<style>
    .content {
        padding: 20px;
        display: flex;
        flex-direction: column;
        min-width: 400px;
        text-align: center;
    }

    .actions {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
    }
</style>
