<script lang="ts">
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
import SensorState from "$components/core/popups/popups/debugger/SensorState.svelte";
import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Button from "$components/ui/Button.svelte";
import Chart from "$components/ui/Chart.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import WindowButton from "$components/ui/WindowButton.svelte";
import PopupsState from "$state/popup.svelte";
import SerialState, { Prompt } from "$state/serial.svelte";
import { track } from "$state/utils";
import Windowed from "../Windowed.svelte";

enum Mode {
	TEXT = 0,
	CHART = 1,
}

let mode = $state(Mode.TEXT);
let input = $state<HTMLInputElement>();

let element = $state<HTMLDivElement>();
function formatDate(date: Date) {
	return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}:${String(date.getMilliseconds()).padStart(3, "0")}`;
}

$effect(() => {
	track(SerialState.log.log);

	if (!element) return;

	tick().then(() =>
		element.scroll({ top: element.scrollHeight, behavior: "smooth" }),
	);
});

let value = $state("");
function send(event: SubmitEvent) {
	event.preventDefault();
	try {
		SerialState.log.write(`${value}\n`);
	} catch {
		PopupsState.open({
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

	for (const item of SerialState.log.log) {
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
	await SerialState.connect(Prompt.MAYBE);
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

<Windowed title={$_("SERIAL_OUTPUT")}>
	{#snippet actions()}
		<WindowButton icon={faArrowDown} onclick={download} />
		<WindowButton icon={mode === Mode.TEXT ? faChartLine : faBars} onclick={switchMode} />
		<WindowButton icon={faTrash} onclick={SerialState.log.clear.bind(SerialState.log)} />
	{/snippet}

	{#if !SerialState.port}
		<div class="flex justify-between items-center bg-primary text-on-primary w-full px-2.5 py-1.5 pl-2.5">
			<div>
				<div class="text-lg font-bold">{$_("NOT_CONNECTED")}</div>
				<div class="text-sm opacity-80">{$_("NOT_CONNECTED_DESC")}</div>
			</div>
			<Button mode={"accent"} name={$_("CHOOSE_ROBOT")} onclick={connect} />
		</div>
	{/if}
	<SensorState />
	{#if mode === Mode.TEXT}
		<div class="w-[800px] max-h-[30vh] overflow-y-auto bg-bg-tint" bind:this={element}>
			{#each SerialState.log.log as item (item.id)}
				<div class="flex p-1.5">
					<div class="text-text-muted border-r border-text-muted mr-1.5 pr-1.5">{formatDate(item.date)}</div>
					<div class="text-primary-dark font-mono">{item.content}</div>
				</div>
			{/each}
		</div>
	{:else if mode === Mode.CHART}
		<Chart />
	{/if}
	{#if SerialState.port}
		<div class="flex flex-col bg-primary text-on-primary">
			<div class="flex gap-2.5 px-2.5 pt-2.5 pb-1.5">
				<Button mode={"accent"} name={format(new Date(), 'yyMMddiHHmmss')} icon={faClock} inline onclick={insertDate} />
			</div>
			<form onsubmit={send}>
				<TextInput placeholder={$_("SERIAL_PROMPT_PLACEHOLDER")} bind:value bind:input mode={"primary"} rounded={false} />
			</form>
		</div>
	{/if}
</Windowed>
