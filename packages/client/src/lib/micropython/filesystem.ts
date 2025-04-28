import type MicroPythonIO from ".";

interface LSFile {
	name: string;
	isDir: boolean;
}

export class FileSystem {
	constructor(private io: MicroPythonIO) {}

	async exists(path: string): Promise<boolean> {
		const exists = await this.io.commands.execute("exists", {
			path,
		});

		return exists.includes("True");
	}

	async ls(path: string): Promise<LSFile[]> {
		const result = await this.io.commands.execute("ls", {
			path,
		});

		return JSON.parse(result);
	}

	async mkdir(path: string): Promise<void> {
		await this.io.commands.execute("mkdir", {
			path,
		});
	}

	async read(path: string): Promise<string> {
		const content = await this.io.commands.execute("read", {
			path,
		});

		return content;
	}

	async rm(path: string): Promise<void> {
		await this.io.commands.execute("rm", {
			path,
		});
	}

	async rmdir(path: string): Promise<void> {
		const contents = await this.ls(path);
		for (const file of contents) {
			if (file.isDir) await this.rmdir(`${path}/${file.name}`);
			else await this.rm(`${path}/${file.name}`);
		}

		await this.io.commands.execute("rmdir", {
			path,
		});
	}

	async write(path: string, content: string): Promise<void> {
		const dir = path.split("/").slice(path.startsWith("/") ? 1 : 0, -1);
		for (let i = 0; i <= dir.length; i++) {
			const path = `/${dir.slice(0, i).join("/")}`;
			const exists = await this.exists(path);
			if (!exists) await this.mkdir(path);
		}

		await this.io.commands.execute("write", {
			path,
			content: btoa(content),
		});
	}
}
