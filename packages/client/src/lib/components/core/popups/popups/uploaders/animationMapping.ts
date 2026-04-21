export function getRobotState(
	failed: boolean,
	done: boolean,
	currentState: string,
) {
	if (failed) return "error";
	if (done) return "done";
	if (currentState === "COMPILATION_STARTED") return "compiling";
	if (
		["UPDATE_STARTED", "WAITING_FOR_PORT", "INSTALLING_LIBRARIES"].includes(
			currentState,
		)
	) {
		return "uploading";
	}

	return "idle";
}
