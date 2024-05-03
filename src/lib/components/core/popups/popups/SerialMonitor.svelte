<script lang="ts">
import TextInput from "$components/ui/TextInput.svelte";
import { log } from "$state/workspace.svelte";
import { tick } from "svelte";
import { _ } from "svelte-i18n";
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
</script>

{#snippet content()}
    <div class="content" bind:this={element}>
        {#each $log as item (item.id)}
            <div class="item">
                <div class="date">{formatDate(item.date)}</div>
                <div class="text">{item.content}</div>
            </div>
        {/each}
    </div>
    <form onsubmit={send}>
        <TextInput
            placeholder={$_("SERIAL_PROMPT_PLACEHOLDER")}
            bind:value
            mode={"primary"}
            rounded={false}
        />
    </form>
{/snippet}

<Windowed title={$_("SERIAL_OUTPUT")} {content} />

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
</style>
