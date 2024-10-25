import type { Programmer } from "$domain/robots.types";
import USBRequestState from "$state/upload.svelte";
import { type LeaphyPort, port as portState } from "$state/workspace.svelte";
import PicoTool from "@leaphy-robotics/picotool-wasm";
import base64 from "base64-js";
import { delay } from "./utils";

const pico = new PicoTool("/picotool/");

export default class Pico implements Programmer {
	async upload(port: LeaphyPort, response: Record<string, string>) {
		await port.close();
		await port.open({ baudRate: 1200 });
		await port.close();
		await delay(1000);
		await USBRequestState.request();

		const sketch = base64.toByteArray(response.sketch);
		await pico.flash(sketch);
		await delay(1000);

		await portState.reconnect();
	}
}
