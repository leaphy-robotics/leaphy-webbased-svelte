import { arduino } from "@leaphy-robotics/leaphy-blocks";
import type { ISerializer } from "blockly/core/interfaces/i_serializer";

class DebuggingSerializer implements ISerializer {
	debugging = $state(false);

	priority = 100;

	constructor() {
		$effect.root(() => {
			$effect(() => {
				arduino.debugging = this.debugging;
			});
		});
	}

	save(): object {
		return { debugging: this.debugging };
	}

	load(state: object): void {
		if ("debugging" in state && typeof state.debugging === "boolean") {
			this.debugging = state.debugging;
		}
	}

	clear(): void {
		this.debugging = false;
	}
}

export default new DebuggingSerializer();
