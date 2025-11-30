<script lang="ts">
    import Windowed from "$components/core/popups/Windowed.svelte";
    import { _ } from "svelte-i18n";
    import type { Question, SolverMessage } from "./types";
    import MultipleChoice from "./prompts/MultipleChoice.svelte";
    import { createGroq } from '@ai-sdk/groq';
    import { generateText, stepCountIs, tool, type ModelMessage } from 'ai';
    import { z } from 'zod';
    import { getStartConversation } from "./system";
    import { onMount } from "svelte";
    import PromptResult from "./prompts/PromptResult.svelte";
    import SvelteMarkdown from "svelte-markdown";
    import { arduino } from "@leaphy-robotics/leaphy-blocks";
    import Schema from "./Schema.svelte";

    const groq = createGroq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
    });

    let messages = $state<SolverMessage[]>([]);

    let conversation = $state<ModelMessage[]>(getStartConversation());
    let question = $state<Question>();

    async function continueConversation() {
        const { response } = await generateText({
            model: groq("openai/gpt-oss-20b"),
            messages: conversation,
            tools: {
                showMultipleChoice: tool({
                    description: "Show the user a multiple choice question",
                    inputSchema: z.object({
                        question: z.string(),
                        choices: z.array(z.string()),
                    }),
                    execute: (prompt) => {
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
        
        conversation.push(...response.messages);
        response.messages.forEach(message => {
            if (message.role !== "assistant") return;

            if (typeof message.content === "string") {
                messages.push({
                    type: "text",
                    role: message.role,
                    content: message.content,
                });
            }

            if (Array.isArray(message.content)) {
                message.content.forEach(part => {
                    if (part.type !== "text") return;

                    messages.push({
                        type: "text",
                        role: message.role,
                        content: part.text,
                    });
                });
            }
        });
    }

    onMount(() => {
        continueConversation();
    });

    $effect(() => {
        $inspect(conversation);
    });
</script>

<Windowed title={$_("SOLVER")}>
    <div class="content">
        {#each messages as message}
            {#if message.type === "text"}
                <div class="message">
                    <span class="role">{message.role}</span>
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
        {/if}
    </div>
</Windowed>


<style>
    .content {
        padding: 20px;
        display: flex;
        flex-direction: column;
        width: 800px;
        max-height: 80vh;
        overflow-y: auto;
    }

    .role {
        font-weight: bold;
    }

    .message {
        display: flex;
        flex-direction: column;
    }
</style>
