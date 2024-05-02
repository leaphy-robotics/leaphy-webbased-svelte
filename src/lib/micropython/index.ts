import Uploader from "$components/core/popups/popups/Uploader.svelte"
import { popups } from "$state/popup.svelte"
import { port } from "$state/workspace.svelte"
import base64 from "base64-js"
import { get } from "svelte/store"

const encoder = new TextEncoder()

export default class MicroPythonIO {
    public port: SerialPort
    public reader: ReadableStreamDefaultReader<Uint8Array>
    public writer: WritableStreamDefaultWriter<Uint8Array>

    async getFirmware() {
        const res = await fetch("https://raw.githubusercontent.com/leaphy-robotics/leaphy-firmware/main/micropython/firmware.uf2")
        const content = await res.arrayBuffer()
        
        return {
            "sketch": base64.fromByteArray(new Uint8Array(content))
        }
    }

    async enterREPLMode() {
        await port.ready
        await port.reserve()
        
        this.port = get(port)
        this.reader = this.port.readable.getReader()
        this.writer = this.port.writable.getWriter()

        await new Promise(resolve => setTimeout(resolve, 500))
        await this.writer.write(new Uint8Array([1]))

        const microPythonInstalled = await Promise.race([
            new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000)),
            new Promise(async (resolve) => {
                const { value, done } = await this.reader.read()

                if (done) return resolve(false)
                if (value.at(-1) !== 62) return resolve(false)

                resolve(true)
            })
        ])

        if (!microPythonInstalled) {
            this.reader.releaseLock()
            this.writer.releaseLock()
            
            port.release()
            await popups.open({
                component: Uploader,
                data: { program: await this.getFirmware() },
                allowInteraction: false
            })
            
            return await this.enterREPLMode()
        }

        console.log("Woohoo! we're good to go!")
    }
}
