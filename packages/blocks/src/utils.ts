// Utility that takes a value that might be a promise and always returns a promise
export async function after<Type>(promise: Type) {
	return promise;
}

export type Board = "l_nano"|"l_nano_esp32"

export interface TestConfig {
	group?: string;
	type: "output"|"statement";
}

export function testOutput(group?: string): TestConfig {
	return {
		type: "output",
		group,
	}
}

export function testStatement(group?: string): TestConfig {
	return {
		type: "statement",
		group,
	}
}

export function testBoards(boards: Record<string, Board[]>) {
	return boards
}
