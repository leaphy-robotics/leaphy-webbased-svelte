// Utility that takes a value that might be a promise and always returns a promise
export async function after<Type>(promise: Type) {
	return promise;
}
