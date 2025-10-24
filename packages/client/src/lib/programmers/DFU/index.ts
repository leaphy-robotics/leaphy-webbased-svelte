import type { Programmer } from "$domain/robots.types";
import SerialState, { type LeaphyPort } from "$state/serial.svelte";
import USBRequestState from "$state/upload.svelte";
import base64 from "base64-js";
import { delay } from "../utils";
import { dfu } from "./dfu";

export default class DFU implements Programmer {
	async upload(port: LeaphyPort, response: Record<string, string>) {
		await port.close();

		const sketch = base64.toByteArray(response.sketch);

		const device = await USBRequestState.request();
		const interfaces = dfu.Device.findDeviceDfuInterfaces(device);
		if (interfaces.length === 0) {
			throw new Error("No DFU interfaces found, you might need to install drivers");
		}

		const dfuDevice = new dfu.Device(device, interfaces[0]);
		await dfuDevice.open();

		await dfuDevice.do_download(4096, sketch.buffer as ArrayBuffer, true);
		await dfuDevice.detach();
		await device.close();

		// Device is about to reset, if we reconnect immediately the esp will just disconnect again
		await delay(100);
		await SerialState.reconnect();
	}
}
