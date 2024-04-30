<script lang="ts">
    import { _ } from "svelte-i18n";
    import Button from "$components/ui/Button.svelte";
    import TextInput from "$components/ui/TextInput.svelte";
    import { popups, type PopupState } from "$state/popup.svelte";
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";
    import { workspace } from "$state/blockly.svelte";
    import { robot } from "$state/workspace.svelte"
    import { serialization } from "blockly";

    interface Props {
        name: string,
        placeholder: string,
        confirm: string
    }
    let { name, placeholder, confirm }: Props = $props()

    let value = $state("")
    let popupState = getContext<Writable<PopupState>>('state')
    
    function cancel() {
        popups.close($popupState.id, false)
    }

    function save() {
        popups.close($popupState.id, value)
    }

    function onsubmit(event: SubmitEvent) {
        event.preventDefault()
        save()
    }
</script>

<form class="content" onsubmit={onsubmit}>
    <h2>{$_(name)}</h2>
    <TextInput bind:value={value} placeholder={$_(placeholder)} mode={"secondary"} rounded={true} />
    <div class="actions">
        <Button onclick={cancel} mode={"secondary"} name={$_("CANCEL")} />
        <Button onclick={save} mode={"primary"} name={$_(confirm)} />
    </div>
</form>

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
