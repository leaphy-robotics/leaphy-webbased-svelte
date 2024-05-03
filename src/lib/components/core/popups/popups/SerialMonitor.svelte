<script lang="ts">
import Button from "$components/ui/Button.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import WindowButton from "$components/ui/WindowButton.svelte";
import { Prompt, log, port } from "$state/workspace.svelte";
import { faArrowDown, faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import { tick } from "svelte";
import { _ } from "svelte-i18n";
import { get } from "svelte/store";
import Windowed from "../Windowed.svelte";

let element: HTMLDivElement;
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

let value = "";
function send(event: SubmitEvent) {
	event.preventDefault();
	log.write(`${value}\n`);
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
</script>

{#snippet actions()}
    <WindowButton icon={faArrowDown} onclick={download} />
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
    <div class="content" bind:this={element}>
        {#each $log as item (item.id)}
            <div class="item">
                <div class="date">{formatDate(item.date)}</div>
                <div class="text">{item.content}</div>
            </div>
        {/each}
    </div>
    {#if $port}
        <form onsubmit={send}>
            <TextInput
                placeholder={$_("SERIAL_PROMPT_PLACEHOLDER")}
                bind:value
                mode={"primary"}
                rounded={false}
            />
        </form>
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
</style>
