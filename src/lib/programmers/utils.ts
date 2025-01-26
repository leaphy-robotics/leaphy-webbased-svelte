import WorkspaceState from "$state/workspace.svelte";

export function delay(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

export async function clearReadBuffer(
	reader: ReadableStreamDefaultReader<Uint8Array>,
) {
	WorkspaceState.uploadLog.push("Clearing read buffer");

	const TIMEOUT = Symbol("timeout");
	const READ_TIMEOUT_MS = 100;
	const ATTEMPT_TIMEOUT_MS = 1500;
	const MAX_ATTEMPTS = 10;

	async function attemptDrainStream() {
		while (true) {
			const result = await Promise.race([
				reader.read(),
				new Promise((resolve) =>
					setTimeout(() => resolve(TIMEOUT), READ_TIMEOUT_MS),
				),
			]);

			if (result === TIMEOUT) {
				WorkspaceState.uploadLog.push(
					"No data received - buffer likely cleared",
				);
				return true;
			}

			if ((result as ReadableStreamReadResult<Uint8Array>).done) {
				WorkspaceState.uploadLog.push("Stream termination detected");
				return true;
			}
		}
	}

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		WorkspaceState.uploadLog.push(`Clearing attempt #${attempt}`);
		const cleanupSuccess = await Promise.race([
			attemptDrainStream(),
			new Promise((resolve) =>
				setTimeout(() => resolve(TIMEOUT), ATTEMPT_TIMEOUT_MS),
			),
		]);

		if (cleanupSuccess) {
			WorkspaceState.uploadLog.push("Read buffer successfully cleared");
			return;
		}
	}

	throw new Error("Failed to clear read buffer after maximum attempts");
}

export function includesAll(values: number[], array: Uint8Array) {
	return values.every((value) => {
		return array.includes(value);
	});
}

export function convertArrayToHex(array: Uint8Array) {
	const result: string[] = [];
	for (let i = 0; i < array.length; i++) {
		result.push(array[i].toString(16));
	}
	return result;
}
