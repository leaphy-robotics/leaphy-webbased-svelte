export const REQUESTS = {
	GET_SYNC: 0x30,
	CRC_EOP: 0x20,
	ENTER_PROG_MODE: 0x50,
	LEAVE_PROG_MODE: 0x51,
	SET_PAGE: 0x64,
	SET_ADDRESS: 0x55,
};

export const RESPONSES = {
	OK: 0x10,
	IN_SYNC: 0x14,
	NOT_IN_SYNC: 0x15,
};

export const SIGNATURE = [0x1e, 0x95, 0x0f];
