export const RobotType = {
	L_FLITZ_UNO: 1,
	L_FLITZ_NANO: 2,
	L_ORIGINAL_UNO: 3,
	L_ORIGINAL_NANO: 4,
	L_ORIGINAL_NANO_ESP32: 5,
	L_ORIGINAL_NANO_RP2040: 6,
	L_CLICK: 7,
	L_NANO: 8,
	L_NANO_ESP32: 9,
	L_NANO_RP2040: 10,
	L_UNO: 11,
	L_MEGA: 12,
	L_CPP: 13,
	L_MICROPYTHON: 14,
};

export interface Programmer {
	upload(port: SerialPort, response: Record<string, string>): Promise<void>;
}
