import type { LeaphyPort } from "$state/serial.svelte";

export const RobotType = {
	L_FLITZ_UNO: 1,
	L_FLITZ_NANO: 2,
	L_ORIGINAL: 3,
	L_STARLING: 4,
	L_NANO: 5,
	L_NANO_ESP32: 6,
	L_NANO_RP2040: 7,
	L_UNO: 8,
	L_MEGA: 9,
	L_CPP: 10,
	L_MICROPYTHON: 11,
};
export interface Programmer {
	upload(port: LeaphyPort, response: Record<string, string>): Promise<void>;
}
