export function track(state: any) {
	if (state) {
	}
}

/** True when the user closed a browser port, device or file chooser. */
export function isUserCancel(error: unknown) {
	return (
		error instanceof DOMException &&
		(error.name === "NotFoundError" || error.name === "AbortError")
	);
}

/**
 * Chrome also uses NotFoundError for problems such as a missing Bluetooth adapter,
 * so a cancelled chooser can only be recognised by its message.
 */
export function isBluetoothCancel(error: unknown) {
	return (
		error instanceof DOMException &&
		error.name === "NotFoundError" &&
		/cancel/i.test(error.message)
	);
}

export async function findAsync<Type>(
	arr: Type[],
	asyncCallback: (item: Type) => Promise<boolean>,
) {
	const promises = arr.map(asyncCallback);
	const results = await Promise.all(promises);
	const index = results.findIndex((result) => result);
	return arr[index];
}
