import type { TestConfig } from "./utils";

export type BlockDefinition = any & {
	type: string;
	test?: TestConfig;
	aiHelp?: string;
	relevanceKey?: string;
};
