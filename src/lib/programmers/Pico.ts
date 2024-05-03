import type { Programmer } from "$domain/robots.types";
import PicoTool from "@leaphy-robotics/picotool-wasm";
import { delay } from "./utils";
import { usbRequest } from "$state/upload.svelte";
import base64 from "base64-js";
import { port as portState } from "$state/workspace.svelte";

const pico = new PicoTool("/picotool/");

export default class Pico implements Programmer {
    async upload(port: SerialPort, response: Record<string, string>) {
        await port.close();
        await port.open({ baudRate: 1200 });
        await port.close();
        await delay(1000);
        await usbRequest.request();

        const sketch = base64.toByteArray(response["sketch"]);
        await pico.flash(sketch);
        await delay(1000);

        await portState.reconnect();
    }
}
