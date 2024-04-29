<script lang="ts">
    import { _ } from "svelte-i18n";
    import Button from "$components/ui/Button.svelte";
    import TextInput from "$components/ui/TextInput.svelte";
    import { popups, type PopupState } from "$state/popup.svelte";
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";
    import { workspace } from "$state/blockly.svelte";
    import workspaceState from "$state/workspace.svelte"
    import { serialization } from "blockly";

    let value = ""
    let popupState = getContext<Writable<PopupState>>('state')
    
    function cancel() {
        popups.close($popupState.id)
    }

    function save() {
        const state = serialization.workspaces.save($workspace);
        const content = JSON.stringify(state)

        const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }))
        const link = document.createElement('a')
        link.href = url
        link.download = `${value}.${workspaceState.robot.id}`
        link.click()
        URL.revokeObjectURL(url);
        link.remove()

        popups.close($popupState.id)
    }

    function onsubmit(event: SubmitEvent) {
        event.preventDefault()
        save()
    }
</script>

<form class="content" onsubmit={onsubmit}>
    <h2>{$_("SAVEAS")}</h2>
    <TextInput bind:value={value} placeholder={$_("GIVE_FILENAME")} mode={"secondary"} rounded={true} />
    <div class="actions">
        <Button onclick={cancel} mode={"secondary"} name={$_("CANCEL")} />
        <Button onclick={save} mode={"primary"} name={$_("SAVE")} />
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
