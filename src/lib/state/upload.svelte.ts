class USBRequestState {
	respond = $state<null | ((device: USBDevice) => void)>(null);

	async request() {
		const [device] = await navigator.usb.getDevices();
		if (device) return device;

		return new Promise<USBDevice>((resolve) => {
			this.respond = (device: USBDevice) => {
				resolve(device);
				this.respond = null;
			};
		});
	}
}

export default new USBRequestState();
