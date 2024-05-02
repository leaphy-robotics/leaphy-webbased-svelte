<script lang="ts">
    import { _, locale } from 'svelte-i18n'

    import leaphyLogo from "$assets/leaphy-logo.svg";
    import Button from "$components/ui/Button.svelte";
    import { popups } from "$state/popup.svelte";
    import Uploader from "../popups/popups/Uploader.svelte";
    import { Prompt, handle, port, code, mode, Mode, robot, saveState } from '$state/workspace.svelte'
    import ContextItem from "$components/ui/ContextItem.svelte";
    import { faDownload, faEnvelope, faFile, faFloppyDisk, faFolder, faGlobe, faGraduationCap, faLightbulb, faMoon, faPen, faQuestionCircle, faRedo, faSave, faSquarePollHorizontal, faUndo, faVolumeHigh, faVolumeXmark } from "@fortawesome/free-solid-svg-icons";
    import block from "$assets/block.svg"
    import { Screen, Theme, theme, selected, screen } from "$state/app.svelte"
    import SaveProject from "../popups/popups/Prompt.svelte";
    import { audio, workspace } from "$state/blockly.svelte";
    import { serialization } from "blockly";
    import Examples from '../popups/popups/Examples.svelte';
    import About from '../popups/popups/About.svelte';
    import UploadLog from '../popups/popups/UploadLog.svelte';
    import JSZip from "jszip";
    import Workspace from '$components/workspace/Workspace.svelte';
    import Select from '$components/ui/Select.svelte';
    import { robots } from '$domain/robots';
    import Advanced from '$components/workspace/advanced/Advanced.svelte';
    import Warning from '../popups/popups/Warning.svelte';
    import MicroPythonIO from '../../../micropython';

    async function upload() {
        popups.open({
            component: Uploader,
            data: {
                source: $code
            },
            allowInteraction: false
        })
    }

    async function connect() {
        await port.connect(Prompt.ALWAYS)
    }

    async function newProject() {
        selected.set(null)
        screen.set(Screen.START)
    }

    function serialize() {
        if ($mode === Mode.BLOCKS) return JSON.stringify(serialization.workspaces.save($workspace))
        else return $code
    }

    async function saveProjectAs() {
        const name = await popups.open({
            component: SaveProject,
            data: {
                name: "SAVEAS",
                placeholder: "GIVE_FILENAME",
                confirm: "SAVE"
            },
            allowInteraction: false
        })
        if (!name) return

        let extension = $robot.id
        if ($mode === Mode.ADVANCED) extension = 'ino'

        const url = URL.createObjectURL(new Blob([serialize()], { type: "text/plain" }))
        const link = document.createElement('a')
        link.href = url
        link.download = `${name}.${extension}`
        link.click()
        URL.revokeObjectURL(url);
        link.remove()

        saveState.set(true)
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
            data: serialize(),
            position: 0,
        });
        await writable.close()
        saveState.set(true)
    }

    function saveDynamic() {
        if ($handle) return saveProject()

        saveProjectAs()
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

    function log() {
        popups.open({
            component: UploadLog,
            data: {},
            allowInteraction: true
        })
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

    async function drivers() {
        const response = await fetch("https://api.github.com/repos/leaphy-robotics/leaphy-firmware/contents/drivers");
        const data = await response.json();
        const files = data.map(({ download_url }) => download_url);
        const zip = new JSZip();

        await Promise.all(files.map(async url => {
            const res = await fetch(url)
            zip.file(url.split("/").pop(), await res.blob())
        }))
        
        const a = document.createElement("a");
        const url = URL.createObjectURL(await zip.generateAsync({ type: "blob" }));
        a.href = url;
        a.download = "leaphy-drivers.zip";
        a.click();
        URL.revokeObjectURL(url)
    }

    function undo() {
        if (!$workspace) return

        $workspace.undo(false)
    }

    function redo() {
        if (!$workspace) return

        $workspace.undo(true)
    }

    async function blocks() {
        if (!$saveState) {
            const ok = await popups.open({
                component: Warning,
                data: {
                    title: "CONFIRMEDITORCHANGE_TITLE",
                    message: "EDITORCHANGEINSTRUCTIONS"
                },
                allowInteraction: false
            })
            if (!ok) return
        }

        mode.set(Mode.BLOCKS)
    }

    async function connectPython() {
        await port.connect(Prompt.MAYBE)
        const io = new MicroPythonIO()
        await io.enterREPLMode()
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
    {#snippet themeContext()}
        <ContextItem selected={$theme === Theme.LIGHT} name={$_("LIGHT_THEME")} onclick={() => theme.set(Theme.LIGHT)} />
        <ContextItem selected={$theme === Theme.DARK} name={$_("DARK_THEME")} onclick={() => theme.set(Theme.DARK)} />
    {/snippet}

    <ContextItem icon={faQuestionCircle} name={$_("MORE_ABOUT")} onclick={about} />
    <ContextItem icon={faGlobe} name={$_("LANGUAGE")} context={languageContext} />
    <ContextItem icon={$theme === Theme.LIGHT ? faLightbulb : faMoon} name={$_("THEME")} context={themeContext} />
    <ContextItem icon={$audio ? faVolumeXmark : faVolumeHigh} name={$_($audio ? "SOUND_OFF" : "SOUND_ON")} onclick={() => audio.update(audio => !audio)} />
    <ContextItem icon={faSquarePollHorizontal} name={$_("VIEW_LOG")} onclick={log} />
    <ContextItem icon={faDownload} name={$_("DOWNLOAD_DRIVERS")} onclick={drivers} />
{/snippet}

<div class="header">
    <div class="comp">
        <img class="logo" src={leaphyLogo} alt="Leaphy" />
        {#if $screen === Screen.WORKSPACE && $mode === Mode.ADVANCED}
            <Select options={Object.values(robots).map(device => ([device.name, device]))} bind:value={$robot} />
        {/if}
        {#if $screen === Screen.WORKSPACE}
            <Button name={$_("PROJECT")} mode={"outlined"} context={projectContext} />
            <Button name={$_("HELP")} mode={"outlined"} context={helpContext} />
            <Button name={$_("MORE")} mode={"outlined"} context={moreContext} />
            {#if $mode !== Mode.PYTHON}
                <Button name={$_("CHOOSE_ROBOT")} mode={"outlined"} onclick={connect} />
            {/if}
        {/if}
    </div>

    <div class="comp">
        {#if $screen === Screen.WORKSPACE && $mode === Mode.BLOCKS}
            <Button mode={"outlined"} icon={faUndo} onclick={undo} />
            <Button mode={"outlined"} icon={faRedo} onclick={redo} />
        {/if}
    </div>

    <div class="comp">
        {#if $screen === Screen.WORKSPACE}
            {#if $mode === Mode.BLOCKS}
                <Button mode={"outlined"} icon={faPen} name={$_("CODE")} onclick={() => mode.set(Mode.ADVANCED)} />
            {:else if $mode === Mode.ADVANCED}
                <Button mode={"outlined"} icon={block} name={$_("BLOCKS")} onclick={blocks} />
            {/if}

            <Button icon={faSave} name={$_("SAVE")} mode={"outlined"} onclick={saveDynamic} />
            {#if $mode === Mode.PYTHON}
                <Button name={$_("CONNECT_PYTHON_ROBOT")} mode={"accent"} onclick={connectPython} />
            {:else}
                <Button name={$_("UPLOAD")} mode={"accent"} onclick={upload} />
            {/if}
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
