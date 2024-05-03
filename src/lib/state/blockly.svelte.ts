import { Workspace } from "blockly";
import { writable } from "svelte/store";

export const workspace = writable<Workspace>();

export const audio = writable<boolean>(
    JSON.parse(localStorage.getItem("audio")) || true,
);
audio.subscribe((audio) => {
    localStorage.setItem("audio", JSON.stringify(audio));
});
