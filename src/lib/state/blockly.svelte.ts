import { Workspace } from "blockly";
import { writable } from "svelte/store";

export const workspace = writable<Workspace>();
