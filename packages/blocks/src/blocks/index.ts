import type { BlockDefinition } from "../types";
import type { Board } from "../utils";

interface BlockDefinitionFileType {
	testConfig?: Record<string, Board[]>;
	blocks?: BlockDefinition[];
}

const blockDefinitions = import.meta.glob("./*.ts", { eager: true }) as Record<
	string,
	BlockDefinitionFileType
>;

function getTestConfig() {
	const testConfig = {} as Record<string, Board[]>;
	Object.values(blockDefinitions).forEach((e) => {
		if (e.testConfig) Object.assign(testConfig, e.testConfig);
	});

	return testConfig;
}

export const blocks = Object.values(blockDefinitions).flatMap(
	(e) => e.blocks ?? [],
);
export const testConfig = getTestConfig();
