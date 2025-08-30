export function getMappingInRange(
	prefix: string,
	suffix: string,
	start: number,
	end: number,
	startConnector: number,
): Record<string, string> {
	const result: Record<string, string> = {};

	let pin = start;
	let connector = startConnector;
	while (true) {
		result[prefix + pin + suffix] = `connector${connector++}pin`;

		if (pin === end) break;
		if (start > end) pin--;
		else pin++;
	}

	return result;
}
