import type { LeaphyPort } from "$state/serial.svelte";

export const RobotType = {
	L_FLITZ_UNO: 1,
	L_FLITZ_NANO: 2,
	L_ORIGINAL_UNO: 3,
	L_ORIGINAL_NANO: 4,
	L_ORIGINAL_NANO_ESP32: 5,
	L_ORIGINAL_NANO_RP2040: 6,
	L_STARLING: 7,
	L_STARLING_NANO_ESP32: 8,
	L_STARLING_NANO_RP2040: 9,
	L_NANO: 10,
	L_NANO_ESP32: 11,
	L_NANO_RP2040: 12,
	L_UNO: 13,
	L_MEGA: 14,
	L_CPP: 15,
	L_MICROPYTHON: 16,
};

export interface Programmer {
	upload(port: LeaphyPort, response: Record<string, string>): Promise<void>;
}
