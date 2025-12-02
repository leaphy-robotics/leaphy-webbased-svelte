<script lang="ts">
    import Windowed from "$components/core/popups/Windowed.svelte";
    import { _ } from "svelte-i18n";
    import type { Packet, Question, SolverMessage } from "./types";
    import MultipleChoice from "./prompts/MultipleChoice.svelte";
    import { getHelpRequest } from "./system";
    import { onMount } from "svelte";
    import PromptResult from "./prompts/PromptResult.svelte";
    import SvelteMarkdown from "svelte-markdown";
    import { arduino } from "@leaphy-robotics/leaphy-blocks";
    import Schema from "./Schema.svelte";
    import { Circle } from "svelte-loading-spinners";
    import Button from "$components/ui/Button.svelte";
    import type { PopupState } from "$state/popup.svelte";
    import { getContext } from "svelte";

    let messages = $state<SolverMessage[]>([]);
    let question = $state<Question>();
    let processing = $state(false);

    let popupState = getContext<PopupState>("state");
    let contentElement: HTMLDivElement;

    function close() {
        popupState.close(true);
    }

    async function continueConversation() {
        processing = true;
        
        const socket = new WebSocket(`${import.meta.env.VITE_BACKEND_URL}/ai/help`);
        await new Promise<void>((resolve) => {
            socket.addEventListener("open", () => {
                socket.send(JSON.stringify({
                    type: "help_request",
                    request: getHelpRequest(),
                }));
            });
            socket.addEventListener("message", (event) => {
                const message = JSON.parse(event.data) as Packet;
                switch (message.type) {
                    case "multiple_choice_question": {
                        question = {
                            type: "multiple_choice",
                            question: message.question,
                            choices: message.choices,
                            respond: (answer) => {
                                socket.send(JSON.stringify({
                                    type: "answer_multiple_choice_question",
                                    answer: answer,
                                }));
                                messages.push({
                                    type: "prompt_result",
                                    question: message.question,
                                    answer: answer,
                                });
                                question = undefined;
                            }
                        };
                        break;
                    }
                    case "show_circuit_schema": {
                        messages.push({
                            type: "schema",
                            builder: arduino.builder,
                        });
                        break;
                    }
                    case "agent_text": {
                        const lastMessage = messages.at(-1);
                        if (lastMessage?.type !== "text") {
                            messages.push({
                                type: "text",
                                content: message.content,
                            });
                            break;
                        }

                        lastMessage.content += message.content;
                        scrollToBottom();
                        break;
                    }
                    case "agent_done": {
                        resolve();
                        break;
                    }
                }
            });
        })
        
        processing = false;
    }

    onMount(() => {
        continueConversation();
    });

    function scrollToBottom() {
        if (contentElement) {
            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
                contentElement.scrollTop = contentElement.scrollHeight;
            });
        }
    }

    // Auto-scroll when messages or question changes
    $effect(() => {
        messages; // Track messages changes
        question; // Track question changes
        scrollToBottom();
    });
</script>

<Windowed title={$_("SOLVER")}>
    <div class="content" bind:this={contentElement}>
        {#each messages as message}
            {#if message.type === "text"}
                <div class="message">
                    <SvelteMarkdown
                        source={message.content}
                    />
                </div>
            {:else if message.type === "prompt_result"}
                <PromptResult question={message.question} answer={message.answer} />
            {:else if message.type === "schema"}
                <Schema builder={message.builder} />
            {/if}
        {/each}

        {#if question}
            {#if question.type === "multiple_choice"}
                <MultipleChoice question={question} />
            {/if}
        {:else if processing}
            <div class="processing">
                <Circle size={20} color={"var(--primary)"} />
                <span>{$_("THINKING")}</span>
            </div>
        {:else}
            <div class="no-question">
                <Button mode="secondary" onclick={close} name={$_("CLOSE")} />
            </div>
        {/if}
    </div>
</Windowed>


<style>
    .processing {
        display: flex;
        background: var(--background-tint);
        padding: 10px;
        border-radius: 10px;
        align-items: center;
        gap: 10px;
    }

    .content {
        padding: 20px;
        display: flex;
        flex-direction: column;
        width: 800px;
        max-height: 80vh;
        overflow-y: auto;
    }

    .message {
        display: flex;
        flex-direction: column;
    }

    .no-question {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
    }
</style>
