<script lang="ts">
    import { _, locale } from 'svelte-i18n'

    import leaphyLogo from "$assets/leaphy-logo.svg";
    import Button from "$components/ui/Button.svelte";
    import { popups } from "$state/popup.svelte";
    import Uploader from "../popups/popups/Uploader.svelte";
    import workspaceState, { Prompt, handle, port } from '$state/workspace.svelte'
    import ContextItem from "$components/ui/ContextItem.svelte";
    import { faEnvelope, faFile, faFloppyDisk, faFolder, faGlobe, faGraduationCap, faQuestion, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
    import appState, { Screen } from "$state/app.svelte"
    import SaveProject from "../popups/popups/SaveProject.svelte";
    import { workspace } from "$state/blockly.svelte";
    import { serialization } from "blockly";
    import Examples from '../popups/popups/Examples.svelte';
    import About from '../popups/popups/About.svelte';

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
        if (!$handle) return

        const writable = await $handle.createWritable()
        await writable.write({
            type: "write",
            data: JSON.stringify(serialization.workspaces.save($workspace)),
            position: 0,
        });
        await writable.close()
    }

    function examples() {
        popups.open({
            component: Examples,
            data: {},
            allowInteraction: true
        })
    }

    function setLocale(language: string) {
        locale.set(language)
        localStorage.setItem('language', language)
    }

    function discord() {
        window.open('https://discord.com/invite/Yeg7Kkrq5W', '_blank').focus()
    }
    function email() {
        window.open('mailto:helpdesk@leaphy.org', '_blank').focus()
    }

    function about() {
        popups.open({
            component: About,
            data: {},
            allowInteraction: true
        })
    }
</script>

{#snippet projectContext()}
    <ContextItem icon={faFile} name={$_("NEW")} onclick={newProject} />
    <ContextItem icon={faFolder} name={$_("OPEN")} onclick={openProject} />
    <ContextItem icon={faFloppyDisk} name={$_("SAVE")} onclick={saveProject} disabled={!$handle} />
    <ContextItem icon={faFloppyDisk} name={$_("SAVEAS")} onclick={saveProjectAs} />
    <ContextItem icon={faGraduationCap} name={$_("EXAMPLES")} onclick={examples} />
{/snippet}
{#snippet helpContext()}
    <ContextItem icon={faQuestionCircle} name={$_("HELP_FORUM")} onclick={discord} />
    <ContextItem icon={faEnvelope} name={$_("EMAIL")} onclick={email} />
{/snippet}
{#snippet moreContext()}
    {#snippet languageContext()}
        <ContextItem selected={$locale === 'en'} name={"English"} onclick={() => setLocale('en')} />
        <ContextItem selected={$locale === 'nl'} name={"Nederlands"} onclick={() => setLocale('nl')} />
    {/snippet}

    <ContextItem icon={faQuestionCircle} name={$_("MORE_ABOUT")} onclick={about} />
    <ContextItem icon={faGlobe} name={$_("LANGUAGE")} context={languageContext} />
{/snippet}

<div class="header">
    <div class="comp">
        <img class="logo" src={leaphyLogo} alt="Leaphy" />
        {#if appState.screen !== Screen.START}
            <Button name={$_("PROJECT")} mode={"outlined"} context={projectContext} />
            <Button name={$_("HELP")} mode={"outlined"} context={helpContext} />
            <Button name={$_("MORE")} mode={"outlined"} context={moreContext} />
            <Button name={$_("CHOOSE_ROBOT")} mode={"outlined"} onclick={connect} />
        {/if}
    </div>

    <div class="comp">
        {#if appState.screen !== Screen.START}
            <Button name={$_("UPLOAD")} mode={"accent"} onclick={upload} />
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
