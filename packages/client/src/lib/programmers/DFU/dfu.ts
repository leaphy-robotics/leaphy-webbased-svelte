import WorkspaceState from "$state/workspace.svelte";

export namespace dfu {
	export const DETACH = 0x00;
	export const DNLOAD = 0x01;
	export const GETSTATUS = 0x03;

	export const dfuIDLE = 2;
	export const dfuDNLOAD_IDLE = 5;
	export const dfuMANIFEST_WAIT_RESET = 8;
	export const dfuERROR = 10;

	export const STATUS_OK = 0x0;

	export interface DFUInterface {
		configuration: USBConfiguration;
		interface: USBInterface;
		alternate: USBAlternateInterface;
		name: string | null;
	}

	export class Device {
		public device_: USBDevice;
		public settings: DFUInterface;
		public intfNumber: number;
		public properties: any;

		constructor(device: USBDevice, settings: DFUInterface) {
			this.device_ = device;
			this.settings = settings;
			this.intfNumber = settings.interface.interfaceNumber;
		}

		static findDeviceDfuInterfaces(device: USBDevice): DFUInterface[] {
			let interfaces: DFUInterface[] = [];
			for (let conf of device.configurations) {
				for (let intf of conf.interfaces) {
					for (let alt of intf.alternates) {
						if (
							alt.interfaceClass === 0xfe &&
							alt.interfaceSubclass === 0x01 &&
							(alt.interfaceProtocol === 0x01 || alt.interfaceProtocol === 0x02)
						) {
							let settings: DFUInterface = {
								configuration: conf,
								interface: intf,
								alternate: alt,
								name: alt.interfaceName,
							};
							interfaces.push(settings);
						}
					}
				}
			}

			return interfaces;
		}

		public logDebug(msg: string): void {
			WorkspaceState.uploadLog.push(msg);
			console.debug(msg);
		}

		public logInfo(msg: string): void {
			WorkspaceState.uploadLog.push(msg);
			console.info(msg);
		}

		public logWarning(msg: string): void {
			WorkspaceState.uploadLog.push(msg);
			console.warn(msg);
		}

		public logProgress(done: number, total?: number): void {
			if (typeof total === "undefined") {
				console.log(done);
			} else {
				console.log(`${done}/${total}`);
			}
		}

		public async open(): Promise<void> {
			await this.device_.open();
			const confValue = this.settings.configuration.configurationValue;
			if (
				this.device_.configuration === null ||
				this.device_.configuration.configurationValue !== confValue
			) {
				await this.device_.selectConfiguration(confValue);
			}

			const intfNumber = this.settings.interface.interfaceNumber;
			if (!this.device_.configuration?.interfaces[intfNumber].claimed) {
				await this.device_.claimInterface(intfNumber);
			}

			const altSetting = this.settings.alternate.alternateSetting;
			let intf = this.device_.configuration?.interfaces[intfNumber];
			if (
				intf?.alternate === null ||
				intf?.alternate.alternateSetting !== altSetting ||
				intf.alternates.length > 1
			) {
				try {
					await this.device_.selectAlternateInterface(intfNumber, altSetting);
				} catch (error) {
					if (
						intf?.alternate.alternateSetting === altSetting &&
						error.endsWith("Unable to set device interface.")
					) {
						this.logWarning(
							`Redundant SET_INTERFACE request to select altSetting ${altSetting} failed`,
						);
					} else {
						throw error;
					}
				}
			}
		}

		public async close(): Promise<void> {
			try {
				await this.device_.close();
			} catch (error) {
				console.log(error);
			}
		}

		public requestOut(
			bRequest: number,
			data?: BufferSource,
			wValue = 0,
		): Promise<number> {
			return this.device_
				.controlTransferOut(
					{
						requestType: "class",
						recipient: "interface",
						request: bRequest,
						value: wValue,
						index: this.intfNumber,
					},
					data,
				)
				.then(
					(result) => {
						if (result.status === "ok") {
							return Promise.resolve(result.bytesWritten);
						}
						return Promise.reject(result.status);
					},
					(error) => {
						return Promise.reject(`ControlTransferOut failed: ${error}`);
					},
				);
		}

		public requestIn(
			bRequest: number,
			wLength: number,
			wValue = 0,
		): Promise<DataView> {
			return this.device_
				.controlTransferIn(
					{
						requestType: "class",
						recipient: "interface",
						request: bRequest,
						value: wValue,
						index: this.intfNumber,
					},
					wLength,
				)
				.then(
					(result) => {
						if (result.status === "ok" && result.data) {
							return Promise.resolve(result.data);
						}
						return Promise.reject(result.status);
					},
					(error) => {
						return Promise.reject(`ControlTransferIn failed: ${error}`);
					},
				);
		}

		public detach(): Promise<number> {
			return this.requestOut(DETACH, undefined, 1000);
		}

		public download(data: BufferSource, blockNum: number): Promise<number> {
			return this.requestOut(DNLOAD, data, blockNum);
		}

		public getStatus(): Promise<{
			status: number;
			pollTimeout: number;
			state: number;
		}> {
			return this.requestIn(GETSTATUS, 6).then(
				(data) =>
					Promise.resolve({
						status: data.getUint8(0),
						pollTimeout: data.getUint32(1, true) & 0xffffff,
						state: data.getUint8(4),
					}),
				(error) => Promise.reject(`DFU GETSTATUS failed: ${error}`),
			);
		}

		public async poll_until(
			state_predicate: (state: number) => boolean,
		): Promise<{ status: number; pollTimeout: number; state: number }> {
			let dfu_status = await this.getStatus();

			let device = this;
			function async_sleep(duration_ms: number): Promise<void> {
				return new Promise((resolve) => {
					device.logDebug(`Sleeping for ${duration_ms}ms`);
					setTimeout(resolve, duration_ms);
				});
			}

			while (
				!state_predicate(dfu_status.state) &&
				dfu_status.state !== dfuERROR
			) {
				await async_sleep(dfu_status.pollTimeout);
				dfu_status = await this.getStatus();
			}

			return dfu_status;
		}

		public poll_until_idle(
			idle_state: number,
		): Promise<{ status: number; pollTimeout: number; state: number }> {
			return this.poll_until((state) => state === idle_state);
		}

		public async do_download(
			xfer_size: number,
			data: ArrayBuffer,
			manifestationTolerant: boolean,
		): Promise<void> {
			let bytes_sent = 0;
			let expected_size = data.byteLength;
			let transaction = 0;

			this.logInfo("Copying data from browser to DFU device");

			// Initialize progress to 0
			this.logProgress(bytes_sent, expected_size);

			while (bytes_sent < expected_size) {
				const bytes_left = expected_size - bytes_sent;
				const chunk_size = Math.min(bytes_left, xfer_size);

				let bytes_written = 0;
				let dfu_status: { status: number; pollTimeout: number; state: number };
				try {
					bytes_written = await this.download(
						data.slice(bytes_sent, bytes_sent + chunk_size),
						transaction++,
					);
					this.logDebug(`Sent ${bytes_written} bytes`);
					dfu_status = await this.poll_until_idle(dfuDNLOAD_IDLE);
				} catch (error) {
					throw `Error during DFU download: ${error}`;
				}

				if (dfu_status.status !== STATUS_OK) {
					throw `DFU DOWNLOAD failed state=${dfu_status.state}, status=${dfu_status.status}`;
				}

				this.logDebug(`Wrote ${bytes_written} bytes`);
				bytes_sent += bytes_written;

				this.logProgress(bytes_sent, expected_size);
			}

			this.logDebug("Sending empty block");
			try {
				await this.download(new ArrayBuffer(0), transaction++);
			} catch (error) {
				throw `Error during final DFU download: ${error}`;
			}

			this.logInfo(`Wrote ${bytes_sent} bytes`);
			this.logInfo("Manifesting new firmware");

			if (manifestationTolerant) {
				// Transition to MANIFEST_SYNC state
				let dfu_status: { status: number; pollTimeout: number; state: number };
				try {
					// Wait until it returns to idle.
					// If it's not really manifestation tolerant, it might transition to MANIFEST_WAIT_RESET
					dfu_status = await this.poll_until(
						(state) => state === dfuIDLE || state === dfuMANIFEST_WAIT_RESET,
					);
					if (dfu_status.state === dfuMANIFEST_WAIT_RESET) {
						this.logDebug(
							"Device transitioned to MANIFEST_WAIT_RESET even though it is manifestation tolerant",
						);
					}
					if (dfu_status.status !== STATUS_OK) {
						throw `DFU MANIFEST failed state=${dfu_status.state}, status=${dfu_status.status}`;
					}
				} catch (error) {
					if (
						error.endsWith(
							"ControlTransferIn failed: NotFoundError: Device unavailable.",
						) ||
						error.endsWith(
							"ControlTransferIn failed: NotFoundError: The device was disconnected.",
						)
					) {
						this.logWarning("Unable to poll final manifestation status");
					} else {
						throw `Error during DFU manifest: ${error}`;
					}
				}
			} else {
				// Try polling once to initiate manifestation
				try {
					let final_status = await this.getStatus();
					this.logDebug(
						`Final DFU status: state=${final_status.state}, status=${final_status.status}`,
					);
				} catch (error) {
					this.logDebug(`Manifest GET_STATUS poll error: ${error}`);
				}
			}

			// Reset to exit MANIFEST_WAIT_RESET
			try {
				await this.device_.reset();
			} catch (error) {
				if (
					error === "NetworkError: Unable to reset the device." ||
					error === "NotFoundError: Device unavailable." ||
					error === "NotFoundError: The device was disconnected."
				) {
					this.logDebug("Ignored reset error");
				} else {
					throw `Error during reset for manifestation: ${error}`;
				}
			}

			return;
		}
	}
}
