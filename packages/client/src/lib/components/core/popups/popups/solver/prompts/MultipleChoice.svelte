<script lang="ts">
import ListSelect from "$components/ui/ListSelect.svelte";
import { _ } from "svelte-i18n";
import type { MultipleChoiceQuestion } from "../types";
import Fa from "svelte-fa";
import {faPaperPlane} from "@fortawesome/free-solid-svg-icons";

interface Props {
	question: MultipleChoiceQuestion;
}

let { question }: Props = $props();

let otherAnswer = $state("");

const hasOther = $derived(question.choices.includes("%SOMETHING_ELSE%"));
const filteredChoices = $derived(
	question.choices
		.filter((c) => c !== "%SOMETHING_ELSE%")
		.map((c) => [c, { id: c }] as [string, { id: string }])
);

let selected = $state<{ id: string } | undefined>(undefined);

function onSelect(value: { id: string }) {
	question.respond(value.id);
}

async function handleDisabledSelect(value: unknown): Promise<boolean> {
	onSelect(value as { id: string });
	return false;
}
</script>

<div class="p-2.5 flex flex-col gap-2.5 min-w-[400px] bg-bg-tint rounded-xl">
    <div class="font-bold">{question.question}</div>
    <ListSelect
        options={filteredChoices}
        bind:value={selected}
        disabledSelect={handleDisabledSelect}
        checkEnabled={() => false}
    >
        {#snippet disabled()}
            <span></span>
        {/snippet}
    </ListSelect>
    {#if hasOther}
        <form class="flex items-center rounded-3xl h-9 overflow-hidden" onsubmit={(e) => {
            e.preventDefault();
            question.respond(otherAnswer);
        }}>
            <input class="flex-1 border-none px-2.5 h-full text-sm bg-secondary text-on-secondary outline-none" bind:value={otherAnswer} placeholder={$_("OTHER_ANSWER")} />
            <button class="flex items-center gap-2 border-none p-2.5 cursor-pointer bg-primary text-on-primary text-sm hover:bg-primary hover:text-on-primary" type="submit">
				<Fa icon={faPaperPlane} />
				{$_("SUBMIT_OTHER_ANSWER")}
			</button>
        </form>
    {/if}
</div>
