import type { ComponentBuilder } from "../../../../../../../../schemas/src";

type BaseQuestion = {
	type: string;
	question: string;
	respond: (answer: string) => void;
};

type MultipleChoiceQuestion = BaseQuestion & {
	type: "multiple_choice";
	choices: string[];
};

type Question = MultipleChoiceQuestion;

type BaseMessage = {
	type: string;
};

type TextMessage = BaseMessage & {
	type: "text";
	content: string;
};

type PromptResultMessage = BaseMessage & {
	type: "prompt_result";
	question: string;
	answer: string;
};

type SchemaMessage = BaseMessage & {
	type: "schema";
	builder: ComponentBuilder;
};

type Message = TextMessage | PromptResultMessage | SchemaMessage;

type BasePacket = {
	type: string;
};

type MultipleChoicePacket = BasePacket & {
	type: "multiple_choice_question";
	question: string;
	choices: string[];
};

type CircuitSchemaPacket = BasePacket & {
	type: "show_circuit_schema";
};

type TextPacket = BasePacket & {
	type: "agent_text";
	content: string;
};

type DonePacket = BasePacket & {
	type: "agent_done";
};

type Packet =
	| MultipleChoicePacket
	| CircuitSchemaPacket
	| TextPacket
	| DonePacket;

export type {
	BaseQuestion,
	MultipleChoiceQuestion,
	Question,
	BaseMessage,
	TextMessage,
	PromptResultMessage,
	SchemaMessage,
	Message as SolverMessage,
	BasePacket,
	MultipleChoicePacket,
	CircuitSchemaPacket,
	TextPacket,
	DonePacket,
	Packet,
};
