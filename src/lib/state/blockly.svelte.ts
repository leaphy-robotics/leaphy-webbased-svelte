import type { Workspace } from "blockly";
import { writable } from "svelte/store";

export const workspace = writable<Workspace>();
export const restore = writable<Record<string, any>>();
export const willRestore = writable<boolean>(true);

export const audio = writable<boolean>(
	JSON.parse(localStorage.getItem("audio")) || true,
);
audio.subscribe((audio) => {
	localStorage.setItem("audio", JSON.stringify(audio));
});

export const canUndo = writable<boolean>(false);
export const canRedo = writable<boolean>(false);
