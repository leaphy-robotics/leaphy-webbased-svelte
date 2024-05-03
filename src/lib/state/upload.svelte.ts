import { writable } from "svelte/store";

function createUSBRequest() {
	const { subscribe, set, update } = writable<
		((device: USBDevice) => void) | null
	>(null);

	return {
		subscribe,
		async request() {
			const [device] = await navigator.usb.getDevices();
			if (device) return device;

			return new Promise<USBDevice>((resolve) => {
				set(resolve);
			});
		},
		respond(device: USBDevice) {
			console.log(device);
			update((resolve) => {
				resolve(device);
				return null;
			});
		},
	};
}
export const usbRequest = createUSBRequest();
