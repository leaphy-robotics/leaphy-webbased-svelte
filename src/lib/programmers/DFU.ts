import type { Programmer } from "$domain/robots.types";
import USBRequestState from "$state/upload.svelte";
import { type LeaphyPort, port as portState } from "$state/workspace.svelte";
import DFUUtil from "@leaphy-robotics/dfu-util-wasm";
import base64 from "base64-js";
import { delay } from "./utils";

const dfu = new DFUUtil("/dfu-util/");

export default class DFU implements Programmer {
	async upload(port: LeaphyPort, response: Record<string, string>) {
		await port.close();
		await delay(1000);
		await USBRequestState.request();

		const sketch = base64.toByteArray(response.sketch);
		await dfu.flash(sketch);
		await delay(1000);

		await portState.reconnect();
	}
}
