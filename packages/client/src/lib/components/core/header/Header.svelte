<script lang="ts">
import { _, locale } from "svelte-i18n";

import block from "$assets/block.svg";
import defaultProgram from "$assets/default-program.json?raw";
import leaphyLogo from "$assets/leaphy-logo.svg";
import Circuit from "$components/core/popups/popups/Circuit.svelte";
import Connect from "$components/core/popups/popups/Connect.svelte";
import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Button from "$components/ui/Button.svelte";
import ContextItem from "$components/ui/ContextItem.svelte";
import { RobotType } from "$domain/robots.types";
import AppState, { Screen, Theme } from "$state/app.svelte";
import BlocklyState from "$state/blockly.svelte";
import MLState from "$state/ml.svelte";
import PopupState from "$state/popup.svelte";
import RecordingsState from "$state/recordings.svelte";
import SerialState, { Prompt } from "$state/serial.svelte";
import WorkspaceState, { Mode } from "$state/workspace.svelte";
import {
	faCircleCheck,
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
	faProjectDiagram,
	faQuestionCircle,
	faRedo,
	faRobot,
	faSave,
	faSquarePollHorizontal,
	faUndo,
	faVolumeHigh,
	faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { arduino } from "@leaphy-robotics/leaphy-blocks";
import { serialization } from "blockly";
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
	if (MLState.enabled) {
		if (BlocklyState.workspace.getBlocksByType("ml_classify").length === 0) {
			return PopupState.open({
				component: ErrorPopup,
				data: {
					title: "ML_MISSING_CLASSIFY_TITLE",
					message: "ML_MISSING_CLASSIFY_DESCRIPTION",
				},
				allowInteraction: false,
			});
		}

		if (MLState.classes.length < 2) {
			return PopupState.open({
				component: ErrorPopup,
				data: {
					title: "ML_NO_CLASSES_TITLE",
					message: "ML_NO_CLASSES_DESCRIPTION",
				},
				allowInteraction: false,
			});
		}

		if (WorkspaceState.Mode === Mode.BLOCKS) WorkspaceState.Mode = Mode.ML;
		else {
			BlocklyState.restore = serialization.workspaces.save(
				BlocklyState.workspace,
			);
			WorkspaceState.Mode = Mode.BLOCKS;
		}

		return;
	}

	window._paq.push(["trackEvent", "Main", "UploadClicked"]);

	PopupState.open({
		component: Uploader,
		data: {
			getCode: async () => {
				if (WorkspaceState.Mode !== Mode.BLOCKS) {
					return WorkspaceState.code;
				}

				const cs = new CompressionStream("gzip");

				// Convert string to stream
				const stream = new Blob([
					JSON.stringify(serialization.workspaces.save(BlocklyState.workspace)),
				])
					.stream()
					.pipeThrough(cs);

				// Read the compressed data
				const compressedBlob = await new Response(stream).blob();
				const arrayBuffer = await compressedBlob.arrayBuffer();

				arduino.program = new Uint8Array(arrayBuffer);
				const code = arduino.workspaceToCode(BlocklyState.workspace);
				arduino.program = null;

				return code;
			},
		},
		allowInteraction: false,
	});
}

async function connect() {
	if (WorkspaceState.Mode === Mode.ADVANCED)
		PopupState.open({
			component: Connect,
			data: {},
			allowInteraction: false,
		});
	else SerialState.connect(Prompt.ALWAYS);
}

async function changeRobot() {
	PopupState.clear();

	await WorkspaceState.tempSave();
	WorkspaceState.handle = undefined;
	WorkspaceState.handleSave = undefined;

	AppState.Screen = Screen.START;
}

async function newProject() {
	PopupState.clear();

	WorkspaceState.handle = undefined;
	WorkspaceState.handleSave = undefined;

	WorkspaceState.code = "";
	serialization.workspaces.load(
		JSON.parse(defaultProgram),
		BlocklyState.workspace,
	);
}

function serialize() {
	if (WorkspaceState.Mode === Mode.BLOCKS || WorkspaceState.Mode === Mode.ML)
		return JSON.stringify(
			serialization.workspaces.save(BlocklyState.workspace),
		);

	return WorkspaceState.code;
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

	let extension = WorkspaceState.robot.id;
	if (WorkspaceState.Mode === Mode.ADVANCED) extension = "ino";
	if (WorkspaceState.Mode === Mode.PYTHON) extension = "py";

	const url = URL.createObjectURL(
		new Blob([serialize()], { type: "text/plain" }),
	);
	const link = document.createElement("a");
	link.href = url;
	link.download = `${name}.${extension}`;
	link.click();
	URL.revokeObjectURL(url);
	link.remove();

	WorkspaceState.saveState = true;
}

async function openProject() {
	const [file] = await window.showOpenFilePicker();
	if (!file) return;

	await WorkspaceState.openFileHandle(file);
}

async function saveProject() {
	if (!WorkspaceState.handle) return;

	await WorkspaceState.handle.write(serialize());
	await WorkspaceState.updateFileHandle();
	WorkspaceState.saveState = true;
}

function saveDynamic() {
	if (WorkspaceState.handle) return saveProject();

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
	if (!WorkspaceState.saveState) {
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

	await WorkspaceState.tempSave();
	BlocklyState.restore = JSON.parse(await WorkspaceState.loadBlocks());
	WorkspaceState.Mode = Mode.BLOCKS;
}

async function cpp() {
	PopupState.clear();
	await WorkspaceState.tempSave();
	WorkspaceState.Mode = Mode.ADVANCED;
}

async function python() {
	PopupState.clear();
	await WorkspaceState.tempSave();
	WorkspaceState.Mode = Mode.PYTHON;
}

async function connectPython() {
	try {
		await SerialState.connect(Prompt.MAYBE);
	} catch {
		return;
	}

	const io = new MicroPythonIO();
	await io.initialize();
	WorkspaceState.microPythonIO = io;
}

function runPython() {
	const io = WorkspaceState.microPythonIO;
	WorkspaceState.microPythonRun = io.runCode(WorkspaceState.code);
}

async function submit() {
	const ok = await PopupState.open({
		component: Warning,
		data: {
			title: "CONFIRMSUBMIT_TITLE",
			message: "CONFIRMSUBMIT_MESSAGE",
		},
		allowInteraction: false,
	});
	if (!ok) return;

	await RecordingsState.submit();
}

async function openCircuitPopup() {
	await PopupState.open({
		component: Circuit,
		data: {},
		allowInteraction: true,
	});
}
</script>

<div class="header">
    <div class="comp">
        <img class="logo" src={leaphyLogo} alt="Leaphy" />
        {#if AppState.Screen === Screen.WORKSPACE}
            <Button
                name={$_("PROJECT")}
                mode={"outlined"}
            >
				{#snippet context(open)}
					<ContextItem icon={faFile} name={$_("NEW")} onclick={newProject} {open} />
					<ContextItem icon={faFolder} name={$_("OPEN")} onclick={openProject} {open} />
					<ContextItem
						icon={faFloppyDisk}
						name={$_("SAVE")}
						onclick={saveProject}
						disabled={!WorkspaceState.handle}
						{open}
					/>
					<ContextItem
						icon={faFloppyDisk}
						name={$_("SAVEAS")}
						onclick={saveProjectAs}
						{open}
					/>
					<ContextItem icon={faRobot} name={$_("CHANGE_ROBOT")} onclick={changeRobot} {open} />
				{/snippet}
			</Button>
            <Button name={$_("HELP")} mode={"outlined"}>
				{#snippet context(open)}
					{#if WorkspaceState.Mode === Mode.BLOCKS}
						<ContextItem
							icon={faGraduationCap}
							name={$_("EXAMPLES")}
							onclick={examples}
							{open}
						/>

						<ContextItem
							icon={faProjectDiagram}
							name={$_("CIRCUIT")}
							onclick={openCircuitPopup}
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
			</Button>
            <Button name={$_("MORE")} mode={"outlined"}>
				{#snippet context(open)}
					<ContextItem
						icon={faQuestionCircle}
						name={$_("MORE_ABOUT")}
						onclick={about}
						{open}
					/>
					<ContextItem
						icon={faGlobe}
						name={$_("LANGUAGE")}
						{open}
					>
						{#snippet context()}
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
					</ContextItem>
					<ContextItem
						icon={AppState.theme === Theme.LIGHT ? faLightbulb : faMoon}
						name={$_("THEME")}
						{open}
					>
						{#snippet context(open)}
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
					</ContextItem>
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
			</Button>
            {#if WorkspaceState.Mode !== Mode.PYTHON}
                <Button
                    name={$_("CHOOSE_ROBOT")}
                    mode={"outlined"}
                    onclick={connect}
                />
            {/if}
        {/if}
    </div>

    <div class="comp">
        {#if AppState.Screen === Screen.WORKSPACE && WorkspaceState.Mode === Mode.BLOCKS}
            <Button mode={"outlined"} icon={faUndo} onclick={undo} disabled={!BlocklyState.canUndo} />
            <Button mode={"outlined"} icon={faRedo} onclick={redo} disabled={!BlocklyState.canRedo} />
        {/if}
    </div>

    <div class="comp">
        {#if AppState.Screen === Screen.WORKSPACE}
            {#if WorkspaceState.Mode === Mode.BLOCKS}

					<Button
						mode={"outlined"}
						icon={faPen}
						name={$_("CODE")}
						onclick={WorkspaceState.robot.type === RobotType.L_MICROPYTHON ? python : cpp}
					/>
            {:else if WorkspaceState.Mode === Mode.ADVANCED || WorkspaceState.Mode === Mode.PYTHON}
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
			{#if RecordingsState.project?.testMode && RecordingsState.selectedAssignment}
				<Button
					icon={faCircleCheck}
					name={$_("SUBMIT")}
					mode="tint"
					onclick={submit}
				/>
			{/if}

            {#if WorkspaceState.Mode === Mode.PYTHON || (WorkspaceState.Mode === Mode.BLOCKS && WorkspaceState.robot.type === RobotType.L_MICROPYTHON)}
                {#if WorkspaceState.microPythonIO}
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
			{:else if WorkspaceState.Mode === Mode.ML}
				<Button name={$_("ML_CLOSE")} mode={"accent"} onclick={upload} />
            {:else}
                <Button name={MLState.enabled ? $_("ML_OPEN") : $_("UPLOAD")} mode={"accent"} onclick={upload} />
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
