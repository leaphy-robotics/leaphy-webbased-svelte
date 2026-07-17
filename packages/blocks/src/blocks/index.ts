import { BlockDefinition } from "../types";
import {Board} from "../utils";

interface BlockDefinitionFileType {
	testConfig?: Record<string, Board[]>
	blocks: BlockDefinition[]
}

const blockDefinitions = import.meta.glob("./*.ts", { eager: true }) as Record<string, BlockDefinitionFileType>;

function getTestConfig() {
	const testConfig = {} as Record<string, Board[]>
	Object.values(blockDefinitions).forEach((e) => {
		if ('testConfig' in e) Object.assign(testConfig, e.testConfig);
	})

	return testConfig;
}

export const blocks = Object.values(blockDefinitions).flatMap((e) => e.blocks).filter(block => !!block)
export const testConfig = getTestConfig()
