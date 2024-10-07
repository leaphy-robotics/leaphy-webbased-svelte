<script lang="ts">
import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Button from "$components/ui/Button.svelte";
import Chart from "$components/ui/Chart.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import WindowButton from "$components/ui/WindowButton.svelte";
import { popups } from "$state/popup.svelte";
import { Prompt, log, port } from "$state/workspace.svelte";
import {
	faArrowDown,
	faBars,
	faChartLine,
	faClock,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import { tick } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import { get } from "svelte/store";
import Windowed from "../Windowed.svelte";

enum Mode {
	TEXT = 0,
	CHART = 1,
}

let mode = $state(Mode.TEXT);
let input = $state<HTMLInputElement>();

let element = $state<HTMLDivElement>();
function formatDate(date: Date) {
	return `${date.getHours()}:${String(date.getMinutes()).padStart(
		2,
		"0",
	)}:${String(date.getSeconds()).padStart(2, "0")}:${String(
		date.getMilliseconds(),
	).padStart(3, "0")}`;
}

log.subscribe(async () => {
	if (!element) return;

	await tick();
	element.scroll({ top: element.scrollHeight, behavior: "smooth" });
});

let value = $state("");
function send(event: SubmitEvent) {
	event.preventDefault();
	try {
		log.write(`${value}\n`);
	} catch {
		popups.open({
			component: ErrorPopup,
			data: {
				title: "ROBOT_RESERVED",
				message: "ROBOT_RESERVED_MESSAGE",
			},
			allowInteraction: false,
		});
	}

	value = "";
}

function download() {
	const data: string[][] = [["date", "time", "data"]];

	for (const item of get(log)) {
		data.push([
			item.date.toLocaleDateString("nl-NL"),
			item.date.toLocaleTimeString("nl-NL"),
			item.content,
		]);
	}

	const content = data.map((e) => e.join(",")).join("\n");
	const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = "serial_monitor_export.csv";
	link.click();
	URL.revokeObjectURL(url);
	link.remove();
}

async function connect() {
	await port.connect(Prompt.MAYBE);
}

function switchMode() {
	if (mode === Mode.CHART) mode = Mode.TEXT;
	else mode = Mode.CHART;
}

function insertDate() {
	value += format(new Date(), "yyMMddiHHmmss");
	if (input) input.focus();
}
</script>

{#snippet actions()}
    <WindowButton icon={faArrowDown} onclick={download} />
	<WindowButton icon={mode === Mode.TEXT ? faChartLine : faBars} onclick={switchMode} />
    <WindowButton icon={faTrash} onclick={log.clear} />
{/snippet}
{#snippet content()}
    {#if !$port}
	    <div class="warning">
	        <div class="desc">
	            <div class="name">{$_("NOT_CONNECTED")}</div>
	            <div class="description">{$_("NOT_CONNECTED_DESC")}</div>
	        </div>
	        <Button mode={"accent"} name={$_("CHOOSE_ROBOT")} onclick={connect} />
	    </div>
    {/if}
    {#if mode === Mode.TEXT}
	    <div class="content" bind:this={element}>
	        {#each $log as item (item.id)}
	            <div class="item">
	                <div class="date">{formatDate(item.date)}</div>
	                <div class="text">{item.content}</div>
	            </div>
	        {/each}
	    </div>
	{:else if mode === Mode.CHART}
		<Chart />
	{/if}
    {#if $port}
		<div class="send">
			<div class="suggestions">
				<Button mode={"accent"} name={format(new Date(), 'yyMMddiHHmmss')} icon={faClock} inline onclick={insertDate} />
			</div>
			<form onsubmit={send}>
				<TextInput
					placeholder={$_("SERIAL_PROMPT_PLACEHOLDER")}
					bind:value
					bind:input
					mode={"primary"}
					rounded={false}
				/>
			</form>
		</div>
    {/if}
{/snippet}

<Windowed title={$_("SERIAL_OUTPUT")} {content} {actions} />

<style>
    .content {
        width: 800px;
        max-height: 50vh;
        overflow-y: auto;
        background: var(--background-tint);
    }

    .item {
        display: flex;
        padding: 5px;
    }

    .date {
        color: var(--text-muted);
        border-right: 1px solid var(--text-muted);
        margin-right: 5px;
        padding-right: 5px;
    }

    .text {
        color: var(--primary-dark-tint);
        font-family: "Courier New", Courier, monospace;
    }

    .warning {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--primary);
        color: var(--on-primary);
        width: 100%;
        padding: 5px;
    }
    .name {
        font-size: 1.1em;
        font-weight: bold;
    }

	.send {
		display: flex;
		flex-direction: column;
		background: var(--primary);
		color: var(--on-primary);
	}

	.suggestions {
		display: flex;
		gap: 10px;
		padding: 10px 10px 5px;
	}
</style>
