<script lang="ts">
import { _, locale } from "svelte-i18n";

import block from "$assets/block.svg";
import leaphyLogo from "$assets/leaphy-logo.svg";
import Connect from "$components/core/popups/popups/Connect.svelte";
import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Button from "$components/ui/Button.svelte";
import ContextItem from "$components/ui/ContextItem.svelte";
import { loadWorkspaceFromString } from "$domain/blockly/blockly";
import { FileHandle } from "$domain/handles";
import { robots } from "$domain/robots";
import AppState, { Screen, Theme } from "$state/app.svelte";
import BlocklyState from "$state/blockly.svelte";
import PopupState from "$state/popup.svelte";
import {
	Mode,
	Prompt,
	code,
	handle,
	microPythonIO,
	microPythonRun,
	mode,
	port,
	robot,
	saveState,
	tempSave,
} from "$state/workspace.svelte";
import {
	faComment,
	faDownload,
	faEnvelope,
	faFile,
	faFloppyDisk,
	faFolder,
	faGlobe,
	faGraduationCap,
	faLightbulb,
	faMoon,
	faPen,
	faQuestionCircle,
	faRedo,
	faSave,
	faSquarePollHorizontal,
	faUndo,
	faVolumeHigh,
	faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { serialization } from "blockly";
import type { Writable } from "svelte/store";
import { get } from "svelte/store";
import { downloadDrivers } from "../../../drivers";
import MicroPythonIO from "../../../micropython";
import About from "../popups/popups/About.svelte";
import Examples from "../popups/popups/Examples.svelte";
import Feedback from "../popups/popups/Feedback.svelte";
import SaveProject from "../popups/popups/Prompt.svelte";
import UploadLog from "../popups/popups/UploadLog.svelte";
import Uploader from "../popups/popups/Uploader.svelte";
import Warning from "../popups/popups/Warning.svelte";

async function upload() {
	window._paq.push(["trackEvent", "Main", "UploadClicked"]);
	PopupState.open({
		component: Uploader,
		data: {
			source: $code,
		},
		allowInteraction: false,
	});
}

async function connect() {
	if ($mode === Mode.ADVANCED)
		PopupState.open({
			component: Connect,
			data: {},
			allowInteraction: false,
		});
	else port.connect(Prompt.ALWAYS);
}

async function newProject() {
	PopupState.clear();

	BlocklyState.willRestore = false;
	BlocklyState.workspace?.clear();

	AppState.screen = Screen.START;
}

function serialize() {
	if ($mode === Mode.BLOCKS)
		return JSON.stringify(serialization.workspaces.save(BlocklyState.workspace));

	return $code;
}

async function saveProjectAs() {
	const name = await PopupState.open({
		component: SaveProject,
		data: {
			name: "SAVEAS",
			placeholder: "GIVE_FILENAME",
			confirm: "SAVE",
			requireValue: true,
		},
		allowInteraction: false,
	});
	if (!name) return;

	let extension = $robot.id;
	if ($mode === Mode.ADVANCED) extension = "ino";
	if ($mode === Mode.PYTHON) extension = "py";

	const url = URL.createObjectURL(
		new Blob([serialize()], { type: "text/plain" }),
	);
	const link = document.createElement("a");
	link.href = url;
	link.download = `${name}.${extension}`;
	link.click();
	URL.revokeObjectURL(url);
	link.remove();

	saveState.set(true);
}

async function openProject() {
	const [file] = await window.showOpenFilePicker();
	if (!file) return;

	handle.set(new FileHandle(file));
	const content = await file.getFile();

	if (file.name.endsWith(".ino")) {
		mode.set(Mode.ADVANCED);
		code.set(await content.text());
	} else if (file.name.endsWith(".py")) {
		mode.set(Mode.PYTHON);
		robot.set(robots.l_nano_rp2040);
		code.set(await content.text());
	} else {
		if (get(mode) === Mode.BLOCKS) {
			if (!loadWorkspaceFromString(await content.text(), BlocklyState.workspace)) {
				return;
			}
		} else {
			BlocklyState.restore.set(JSON.parse(await content.text()));
			mode.set(Mode.BLOCKS);
		}

		if (!robots[file.name.split(".").at(-1)]) {
			PopupState.open({
				component: ErrorPopup,
				data: {
					title: "UNDEFINED_ROBOT",
					message: "UNDEFINED_ROBOT_MESSAGE",
				},
				allowInteraction: false,
			});
			return;
		}

		robot.set(robots[file.name.split(".").at(-1)]);
	}
}

async function saveProject() {
	if (!$handle) return;

	await get(handle).write(serialize());
	saveState.set(true);
}

function saveDynamic() {
	if ($handle) return saveProject();

	saveProjectAs();
}

function examples() {
	PopupState.open({
		component: Examples,
		data: {},
		allowInteraction: true,
	});
}

function setLocale(language: string) {
	locale.set(language);
	localStorage.setItem("language", language);
}

function log() {
	PopupState.open({
		component: UploadLog,
		data: {},
		allowInteraction: true,
	});
}

function discord() {
	window.open("https://discord.com/invite/Yeg7Kkrq5W", "_blank").focus();
}
function email() {
	window.open("mailto:helpdesk@leaphy.org", "_blank").focus();
}

function feedback() {
	PopupState.open({
		component: Feedback,
		data: {},
		allowInteraction: true,
	});
}

function about() {
	PopupState.open({
		component: About,
		data: {},
		allowInteraction: true,
	});
}

function undo() {
	BlocklyState.workspace?.undo(false);
}

function redo() {
	BlocklyState.workspace?.undo(true);
}

async function blocks() {
	PopupState.clear();
	if (!$saveState) {
		const ok = await PopupState.open({
			component: Warning,
			data: {
				title: "CONFIRMEDITORCHANGE_TITLE",
				message: "EDITORCHANGEINSTRUCTIONS",
			},
			allowInteraction: false,
		});
		if (!ok) return;
	}

	tempSave();
	BlocklyState.restore.set(
		JSON.parse(localStorage.getItem(`session_blocks_${get(robot).id}`)),
	);
	mode.set(Mode.BLOCKS);
}

async function cpp() {
	PopupState.clear();
	tempSave();
	mode.set(Mode.ADVANCED);
}

async function connectPython() {
	try {
		await port.connect(Prompt.MAYBE);
	} catch {
		return;
	}

	const io = new MicroPythonIO();
	await io.initialize();
	microPythonIO.set(io);
}

function runPython() {
	const io = get(microPythonIO);
	microPythonRun.set(io.runCode(get(code)));
}
</script>

{#snippet projectContext(open: Writable<boolean>)}
    <ContextItem icon={faFile} name={$_("NEW")} onclick={newProject} {open} />
    <ContextItem icon={faFolder} name={$_("OPEN")} onclick={openProject} {open} />
    <ContextItem
        icon={faFloppyDisk}
        name={$_("SAVE")}
        onclick={saveProject}
        disabled={!$handle}
        {open}
    />
    <ContextItem
        icon={faFloppyDisk}
        name={$_("SAVEAS")}
        onclick={saveProjectAs}
        {open}
    />
{/snippet}
{#snippet helpContext(open: Writable<boolean>)}
    {#if $mode === Mode.BLOCKS}
        <ContextItem
            icon={faGraduationCap}
            name={$_("EXAMPLES")}
            onclick={examples}
            {open}
        />
    {/if}
    <ContextItem
        icon={faQuestionCircle}
        name={$_("HELP_FORUM")}
        onclick={discord}
        {open}
    />
    <ContextItem icon={faEnvelope} name="{$_('EMAIL')} (helpdesk@leaphy.org)" onclick={email} {open} />
    <ContextItem icon={faComment} name={$_("FEEDBACK")} onclick={feedback} {open} />
{/snippet}
{#snippet moreContext(open: Writable<boolean>)}
    {#snippet languageContext(open: Writable<boolean>)}
        <ContextItem
            selected={$locale === "en"}
            name={"English"}
            onclick={() => setLocale("en")}
            {open}
        />
        <ContextItem
            selected={$locale === "nl"}
            name={"Nederlands"}
            onclick={() => setLocale("nl")}
            {open}
        />
    {/snippet}
    {#snippet themeContext(open: Writable<boolean>)}
        <ContextItem
            selected={AppState.theme === Theme.LIGHT}
            name={$_("LIGHT_THEME")}
            onclick={() => AppState.theme = Theme.LIGHT}
            {open}
        />
        <ContextItem
            selected={AppState.theme === Theme.DARK}
            name={$_("DARK_THEME")}
            onclick={() => AppState.theme = Theme.DARK}
            {open}
        />
    {/snippet}

    <ContextItem
        icon={faQuestionCircle}
        name={$_("MORE_ABOUT")}
        onclick={about}
        {open}
    />
    <ContextItem
        icon={faGlobe}
        name={$_("LANGUAGE")}
        context={languageContext}
        {open}
    />
    <ContextItem
        icon={AppState.theme === Theme.LIGHT ? faLightbulb : faMoon}
        name={$_("THEME")}
        context={themeContext}
        {open}
    />
    <ContextItem
        icon={BlocklyState.audio ? faVolumeXmark : faVolumeHigh}
        name={$_(BlocklyState.audio ? "SOUND_OFF" : "SOUND_ON")}
        onclick={() => BlocklyState.audio = !BlocklyState.audio}
        {open}
    />
    <ContextItem
        icon={faSquarePollHorizontal}
        name={$_("VIEW_LOG")}
        onclick={log}
        {open}
    />
    <ContextItem
        icon={faDownload}
        name={$_("DOWNLOAD_DRIVERS")}
        onclick={downloadDrivers}
        {open}
    />
{/snippet}

<div class="header">
    <div class="comp">
        <img class="logo" src={leaphyLogo} alt="Leaphy" />
        {#if AppState.screen === Screen.WORKSPACE}
            <Button
                name={$_("PROJECT")}
                mode={"outlined"}
                context={projectContext}
            />
            <Button name={$_("HELP")} mode={"outlined"} context={helpContext} />
            <Button name={$_("MORE")} mode={"outlined"} context={moreContext} />
            {#if $mode !== Mode.PYTHON}
                <Button
                    name={$_("CHOOSE_ROBOT")}
                    mode={"outlined"}
                    onclick={connect}
                />
            {/if}
        {/if}
    </div>

    <div class="comp">
        {#if AppState.screen === Screen.WORKSPACE && $mode === Mode.BLOCKS}
            <Button mode={"outlined"} icon={faUndo} onclick={undo} disabled={!BlocklyState.canUndo} />
            <Button mode={"outlined"} icon={faRedo} onclick={redo} disabled={!BlocklyState.canRedo} />
        {/if}
    </div>

    <div class="comp">
        {#if AppState.screen === Screen.WORKSPACE}
            {#if $mode === Mode.BLOCKS}
                <Button
                    mode={"outlined"}
                    icon={faPen}
                    name={$_("CODE")}
                    onclick={cpp}
                />
            {:else if $mode === Mode.ADVANCED}
                <Button
                    mode={"outlined"}
                    icon={block}
                    name={$_("BLOCKS")}
                    onclick={blocks}
                />
            {/if}

            <Button
                icon={faSave}
                name={$_("SAVE")}
                mode={"outlined"}
                onclick={saveDynamic}
            />
            {#if $mode === Mode.PYTHON}
                {#if $microPythonIO}
                    <Button
                        name={$_("RUN_CODE")}
                        mode={"accent"}
                        onclick={runPython}
                    />
                {:else}
                    <Button
                        name={$_("CONNECT_PYTHON_ROBOT")}
                        mode={"accent"}
                        onclick={connectPython}
                    />
                {/if}
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
