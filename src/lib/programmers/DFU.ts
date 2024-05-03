import type { Programmer } from "$domain/robots.types";
import { usbRequest } from "$state/upload.svelte";
import { delay } from "./utils";
import DFUUtil from "@leaphy-robotics/dfu-util-wasm";
import base64 from "base64-js";
import { port as portState } from "$state/workspace.svelte";

const dfu = new DFUUtil("/dfu-util/");

export default class DFU implements Programmer {
	async upload(port: SerialPort, response: Record<string, string>) {
		await port.close();
		await delay(1000);
		await usbRequest.request();

		const sketch = base64.toByteArray(response.sketch);
		await dfu.flash(sketch);
		await delay(1000);

		await portState.reconnect();
	}
}
