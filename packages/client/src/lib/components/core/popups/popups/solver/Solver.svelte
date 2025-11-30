<script lang="ts">
    import Windowed from "$components/core/popups/Windowed.svelte";
    import { _ } from "svelte-i18n";
    import type { Question, SolverMessage } from "./types";
    import MultipleChoice from "./prompts/MultipleChoice.svelte";
    import { createGroq } from '@ai-sdk/groq';
    import { createMistral } from '@ai-sdk/mistral';
    import { streamText, stepCountIs, tool, type ModelMessage } from 'ai';
    import { z } from 'zod';
    import { getStartConversation } from "./system";
    import { onMount } from "svelte";
    import PromptResult from "./prompts/PromptResult.svelte";
    import SvelteMarkdown from "svelte-markdown";
    import { arduino } from "@leaphy-robotics/leaphy-blocks";
    import Schema from "./Schema.svelte";
    import { Circle } from "svelte-loading-spinners";
    import Button from "$components/ui/Button.svelte";
    import type { PopupState } from "$state/popup.svelte";
    import { getContext } from "svelte";

    const groq = createGroq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
    });

    const mistral = createMistral({
        apiKey: import.meta.env.VITE_MISTRAL_API_KEY,
    });

    let messages = $state<SolverMessage[]>([]);

    let conversation = $state<ModelMessage[]>(getStartConversation());
    let question = $state<Question>();
    let processing = $state(false);
    let popupState = getContext<PopupState>("state");
    let contentElement: HTMLDivElement;
    let currentTextMessage = $state<string>("");
    let currentTextMessageIndex = $state<number>(-1);

    function close() {
        popupState.close(true);
    }

    async function continueConversation() {
        processing = true;
        currentTextMessage = "";
        currentTextMessageIndex = -1;

        // Helper function to finalize current text message if it has content
        function finalizeCurrentTextMessage() {
            if (currentTextMessageIndex >= 0 && currentTextMessageIndex < messages.length) {
                if (currentTextMessage.trim()) {
                    messages[currentTextMessageIndex] = {
                        type: "text",
                        role: "assistant",
                        content: currentTextMessage,
                    };
                } else {
                    // Remove empty text message
                    messages.splice(currentTextMessageIndex, 1);
                }
                currentTextMessage = "";
                currentTextMessageIndex = -1;
            }
        }

        // Helper function to start a new text message
        function startNewTextMessage() {
            if (currentTextMessageIndex === -1) {
                currentTextMessageIndex = messages.length;
                messages.push({
                    type: "text",
                    role: "assistant",
                    content: "",
                });
            }
        }

        const result = await streamText({
            model: mistral("mistral-medium-latest"),
            messages: conversation,
            tools: {
                showMultipleChoice: tool({
                    description: "Show the user a multiple choice question",
                    inputSchema: z.object({
                        question: z.string(),
                        choices: z.array(z.string()),
                    }),
                    execute: (prompt) => {
                        // Finalize any current text message before tool execution
                        finalizeCurrentTextMessage();
                        return new Promise((resolve => {
                            question = {
                                type: "multiple_choice",
                                question: prompt.question,
                                choices: prompt.choices,
                                respond(answer) {
                                    resolve({ content: answer });
                                    messages.push({
                                        type: "prompt_result",
                                        question: prompt.question,
                                        answer: answer,
                                    });
                                    question = undefined;
                                }
                            }
                        }))
                    },
                }),
                displayCircuitSchema: tool({
                    description: "Display a circuit schema for the current project",
                    inputSchema: z.object({}), 
                    execute: () => {
                        // Finalize any current text message before tool execution
                        finalizeCurrentTextMessage();
                        messages.push({
                            type: "schema",
                            builder: arduino.builder,
                        })

                        console.log('test');

                        return { content: "done" }
                    }
                })
            },
            stopWhen: () => false
        });

        // Stream all events (text and tool calls)
        for await (const chunk of result.fullStream) {
            if (chunk.type === 'text-delta') {
                // Start a new text message if we don't have one
                startNewTextMessage();
                currentTextMessage += chunk.text;
                if (currentTextMessageIndex >= 0 && currentTextMessageIndex < messages.length) {
                    messages[currentTextMessageIndex] = {
                        type: "text",
                        role: "assistant",
                        content: currentTextMessage,
                    };
                }
            } else if (chunk.type === 'tool-call') {
                // When a tool call starts, finalize any current text message
                finalizeCurrentTextMessage();
                // Tool execution will add messages via the execute functions
            } else if (chunk.type === 'text-end') {
                // Text chunk is done, finalize it
                finalizeCurrentTextMessage();
            }
        }

        // Finalize any remaining text message
        finalizeCurrentTextMessage();

        // Wait for the stream to complete and get the final result
        const finalResult = await result;
        const response = await finalResult.response;
        
        // The response contains the final messages with tool calls and results in correct order
        // Add them to the conversation
        if (response?.messages) {
            conversation.push(...response.messages);
        }
        
        // Add system message indicating user is still stuck
        conversation.push({
            role: "user",
            content: "The user has indicated that they are still stuck. Please ask them for more information."
        });

        currentTextMessage = "";
        currentTextMessageIndex = -1;
        processing = false;
    }

    onMount(() => {
        continueConversation();
    });

    $effect(() => {
        $inspect(conversation);
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
                <Button mode="primary" onclick={continueConversation} name={$_("STILL_STUCK")} />
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
