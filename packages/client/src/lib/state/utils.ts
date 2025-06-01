export function track(state: any) {
	if (state) {
	}
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
