// Resolves after the browser has painted, so state changes are visible before heavy synchronous work starts
export function afterPaint() {
	return new Promise<void>((resolve) =>
		requestAnimationFrame(() => setTimeout(resolve)),
	);
}
