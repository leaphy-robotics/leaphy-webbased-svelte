import type MicroPythonIO from ".";

interface LSFile {
    name: string,
    isDir: boolean
}

export class FileSystem {
    constructor(private io: MicroPythonIO) { }

    async exists(path: string): Promise<boolean> {
        const exists = await this.io.commands.execute('exists', {
            path
        })

        return exists.includes('True')
    }

    async ls(path: string): Promise<LSFile[]> {
        const result = await this.io.commands.execute('ls', {
            path
        })

        return JSON.parse(result)
    }

    async mkdir(path: string): Promise<void> {
        await this.io.commands.execute('mkdir', {
            path
        })
    }

    async read(path: string): Promise<string> {
        const content = await this.io.commands.execute('read', {
            path
        })

        return content
    }

    async rm(path: string): Promise<void> {
        await this.io.commands.execute('rm', {
            path
        })
    }

    async write(path: string, content: string): Promise<void> {
        await this.io.commands.execute('write', {
            path, content: btoa(content)
        })
    }
}
