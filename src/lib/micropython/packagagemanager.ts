import type MicroPythonIO from ".";

export class PackageManager {
    constructor(private io: MicroPythonIO) { }

    async fetchMip(url: string) {
        if (!url.startsWith("github:")) throw new Error("Not implemented")

        const data = url.split('/')
        const repo = data[0].split('github:')[1] + "/" + data[1]
        const file = data.slice(2).join('/')
        url = `https://raw.githubusercontent.com/${repo}/master/${file}`

        const res = await fetch(url)
        let content = await res.text()

        if (url.endsWith(".py") || url.endsWith(".py/")) {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/minify/python`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    source_code: btoa(content),
                    filename: data.at(-1),
                })
            })

            const json = await res.json()
            content = atob(json["source_code"])
        }

        return content
    }

    async checkLibraryVersion(version: string, name: string) {
        console.log(version, name)
        if (!await this.io.fs.exists(`${name}.json`))
            return false

        console.log('exists')
        try {
            const contents = JSON.parse(atob(await this.io.fs.read(`${name}.json`)))
            console.log(contents)

            return version === contents["version"]
        } catch {
            return false
        }
    }

    getLibraryName(url: string) {
        if (!url.startsWith("github:")) throw new Error("Not implemented")

        return url.split("/", 3)[1]
    }

    async flashLibrary(url: string) {
        if (!await this.io.fs.exists("lib"))
            await this.io.fs.mkdir("lib")

        const manifest = JSON.parse(await this.fetchMip(url))
        const version = manifest["version"]
        if (await this.checkLibraryVersion(version, this.getLibraryName(url))) 
            return console.log("not installing")

        const files = manifest["urls"]
        const contents = await Promise.all(files.map(async ([name, url]) => ({
            name: `lib/${name}`,
            content: await this.fetchMip(url)
        })))

        const res = await this.io.fs.ls('/lib')
        for (const file of res) {
            if (file["name"].endsWith(".dist-info")) {
                await this.io.fs.rmdir(`/lib/${file.name}`);
            }
        }

        for (const file of contents) {
            if (await this.io.fs.exists(file.name)) {
                await this.io.fs.rm(file.name)
            }

            await this.io.fs.write(file.name, file.content)
        }

        if (await this.io.fs.exists(`/${this.getLibraryName(url)}.json`)) {
            await this.io.fs.rm(`/${this.getLibraryName(url)}.json`)
        }

        await this.io.fs.write(`/${this.getLibraryName(url)}.json`, btoa(JSON.stringify({ version })))
    }
}
