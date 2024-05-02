import type MicroPythonIO from ".";

export class Commands {
    private commands: Record<string, string>

    constructor(private io: MicroPythonIO) { }

    async loadCommands() {
        this.commands = Object.fromEntries(await Promise.all(
            Object.entries(import.meta.glob("./commands/*.py", { query: 'raw' }))
                .map(async ([name, command]) => {
                    return [name.split('/').at(-1).slice(0, -3), ((await command()) as any).default]
                })
        ))
    }

    async execute(command: string, params: Record<string, string>) {
        let cmd = this.commands[command]
        Object.entries(params).forEach(([name, value]) => {
            cmd = cmd.replaceAll(`%${name.toUpperCase()}%`, value)
        })

        const events = this.io.runCode(cmd)
        return new Promise<string>((resolve, reject) => {
            events.addEventListener('done', event => {
                if (event.stderr.length > 0) reject(event.stderr)
                
                resolve(event.stdout)
            })
        })
    }
}
