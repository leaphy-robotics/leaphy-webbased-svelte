<script lang="ts">
import { _ } from "svelte-i18n";
import type { MultipleChoiceQuestion } from "../types";
import TextInput from "$components/ui/TextInput.svelte";
import Button from "$components/ui/Button.svelte";

interface Props {
    question: MultipleChoiceQuestion;
}

let { question }: Props = $props();

let otherAnswer = $state("");
</script>

<div class="content">
    <div class="title">{$_("Multiple Choice")}</div>
    <div class="question">{question.question}</div>
    <div class="choices">
        {#each question.choices as choice}
            {#if choice === "%SOMETHING_ELSE%"}
                <form class="other-answer" onsubmit={(e) => {
                    e.preventDefault();
                    question.respond(otherAnswer);
                }}>
                    <input class="input" bind:value={otherAnswer} placeholder={$_("OTHER_ANSWER")} />
                    <button class="submit" type={"submit"}>{$_("SUBMIT")}</button>
                </form>
            {:else}
                <button class="choice" onclick={() => question.respond(choice)}>{choice}</button>
            {/if}
        {/each}
    </div>
</div>

<style>
    .other-answer {
        display: flex;
        align-items: center;
    }

    .input {
        flex: 1;
        border: none;
        padding: 10px;
        border-radius: 0 0 0 10px;
        font-size: 0.8em;
    }

    .submit {
        border: none;
        padding: 10px;
        cursor: pointer;
        background: var(--secondary);
        font-size: 0.8em;
    }

    .content {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 400px;

        background: var(--background-tint);
        border-radius: 10px;
        padding: 10px;
    }

    .title {
        font-weight: bold;
    }

    .choices {
        display: flex;
        flex-direction: column;
        border-radius: 10px;
        overflow: hidden;
    }

    .choice {
        background: var(--secondary);
        border: none;
        border-bottom: 1px solid var(--background-tint);
        padding: 10px;
        cursor: pointer;
        font-size: 0.8em;
        text-align: left;
    }
    .choice:hover {
        background: var(--primary);
        color: var(--on-primary);
    }
    .choice:last-child {
        border-bottom: none;
    }
</style>