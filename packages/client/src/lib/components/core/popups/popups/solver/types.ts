import type { ComponentBuilder } from "../../../../../../../../schemas/src";

type BaseQuestion = {
    type: string;
    question: string;
    respond: (answer: string) => void;
}

type MultipleChoiceQuestion = BaseQuestion & {
    type: "multiple_choice";
    choices: string[];
}

type Question = MultipleChoiceQuestion;

type BaseMessage = {
    type: string;
}

type TextMessage = BaseMessage & {
    type: "text";
    role: "user" | "assistant";
    content: string;
}

type PromptResultMessage = BaseMessage & {
    type: "prompt_result";
    question: string;
    answer: string;
}

type SchemaMessage = BaseMessage & {
    type: "schema";
    builder: ComponentBuilder;
}

type Message = TextMessage | PromptResultMessage | SchemaMessage;

export type { 
    BaseQuestion, MultipleChoiceQuestion, Question, 
    BaseMessage, TextMessage, PromptResultMessage, SchemaMessage, Message as SolverMessage
};
