<script lang="ts">
    import leaphyLogo from "$assets/leaphy-logo.svg";
    import Button from "$components/ui/Button.svelte";
    import { popups } from "$state/popup.svelte";
    import Uploader from "../popups/popups/Uploader.svelte";
    import workspaceState, { Prompt, handle, port } from '$state/workspace.svelte'
    import ContextItem from "$components/ui/ContextItem.svelte";
    import { faFile, faFloppyDisk, faFolder, faGlobe, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
    import appState, { Screen } from "$state/app.svelte"
    import SaveProject from "../popups/popups/SaveProject.svelte";
    import { workspace } from "$state/blockly.svelte";
    import { serialization } from "blockly";

    async function upload() {
        popups.open({
            component: Uploader,
            data: {
                source: workspaceState.code
            },
            allowInteraction: false
        })
    }

    async function connect() {
        await port.connect(Prompt.ALWAYS)
    }

    async function newProject() {
        appState.selected = null
        appState.screen = Screen.START
    }

    async function saveProjectAs() {
        popups.open({
            component: SaveProject,
            data: {},
            allowInteraction: false
        })
    }

    async function openProject() {
        const [file] = await window.showOpenFilePicker()
        if (!file) return

        handle.update(() => file)
        const content = await file.getFile()
        serialization.workspaces.load(JSON.parse(await content.text()), $workspace)
    }

    async function saveProject() {
        console.log($handle)
        if (!$handle) return

        const writable = await $handle.createWritable()
        await writable.write({
            type: "write",
            data: JSON.stringify(serialization.workspaces.save($workspace)),
            position: 0,
        });
        await writable.close()
    }
</script>

{#snippet projectContext()}
    <ContextItem icon={faFile} name={"New"} onclick={newProject} />
    <ContextItem icon={faFolder} name={"Open"} onclick={openProject} />
    <ContextItem icon={faFloppyDisk} name={"Save"} onclick={saveProject} disabled={!$handle} />
    <ContextItem icon={faFloppyDisk} name={"Save as..."} onclick={saveProjectAs} />
    <ContextItem icon={faGraduationCap} name={"Examples"} onclick={console.log} />
{/snippet}
{#snippet moreContext()}
    {#snippet languageContext()}
        <ContextItem name={"English"} onclick={console.log} />
    {/snippet}

    <ContextItem icon={faGlobe} name={"Language"} context={languageContext} />
{/snippet}

<div class="header">
    <div class="comp">
        <img class="logo" src={leaphyLogo} alt="Leaphy" />
        {#if appState.screen !== Screen.START}
            <Button name={"My Project"} mode={"outlined"} context={projectContext} />
            <Button name={"More..."} mode={"outlined"} context={moreContext} />
            <Button name={"Connect"} mode={"outlined"} onclick={connect} />
        {/if}
    </div>

    <div class="comp">
        {#if appState.screen !== Screen.START}
            <Button name={"Upload"} mode={"accent"} onclick={upload} />
        {/if}
    </div>
</div>

<style>
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--primary);
        padding: 10px;
        height: 64px;
    }
    .comp {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .logo {
        height: 18px;
        margin-right: 10px;
    }
</style>
