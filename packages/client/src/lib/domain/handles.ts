import WorkspaceState from "$state/workspace.svelte";

export interface Handle {
	write: (content: string) => Promise<void>;
}

export class PermissionDeniedError extends Error {
	name = "PermissionDeniedError";
}

export class FileHandle implements Handle {
	constructor(private handle: FileSystemFileHandle) {}

	async write(content: string) {
		// A file from the open picker starts with read access only
		const descriptor = { mode: "readwrite" } as const;
		if (
			(await this.handle.queryPermission(descriptor)) !== "granted" &&
			(await this.handle.requestPermission(descriptor)) !== "granted"
		) {
			throw new PermissionDeniedError();
		}

		const writable = await this.handle.createWritable();
		await writable.write({
			type: "write",
			data: content,
			position: 0,
		});
		await writable.close();
	}
}

export class PythonHandle implements Handle {
	constructor(private path: string) {}

	async write(content: string) {
		const io = WorkspaceState.microPythonIO;

		await io.fs.write(this.path, content);
	}
}
