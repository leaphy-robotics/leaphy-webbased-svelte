import Start from "$components/start/Start.svelte";
import Workspace from "$components/workspace/Workspace.svelte";
import type { Component } from "svelte";

export const Screen = {
	START: Start as Component,
	WORKSPACE: Workspace as Component,
};

export enum Theme {
	LIGHT = "light",
	DARK = "dark",
}

export interface Library {
	name: string;
	author: string;
	paragraph: string;
	versions: string[];
}

if (!["light", "dark"].includes(localStorage.getItem("theme"))) {
	localStorage.setItem("theme", Theme.LIGHT);
}

class LibraryState {
	libraries = $state<Library[]>([]);
	installed = $state<[string, string][]>([]);

	async query() {
		const res = await fetch(
			"https://downloads.arduino.cc/libraries/library_index.json",
		);
		const json = await res.json();

		const libraries: Record<string, Library> = {};
		for (const lib of json.libraries) {
			if (!libraries[lib.name]) {
				libraries[lib.name] = {
					name: lib.name,
					author: lib.author,
					paragraph: lib.paragraph?.replace(/<\/?br ?\/?>/g, "\n"),
					versions: [],
				};
			}

			libraries[lib.name].versions.push(lib.version);
		}
		for (const library of Object.values(libraries)) {
			library.versions.sort((a, b) =>
				b.localeCompare(a, undefined, { numeric: true }),
			);
		}

		this.libraries = Object.values(libraries);
	}

	install(...libraries: string[]) {
		libraries.forEach((library) => {
			const [name, version] = library.split("@");
			if (!version) {
				console.warn(
					`Library ${name} doesn't have a version pinned, this is recommended for production purposes!`,
				);
			}

			this.installed.push([name, version]);
		});
	}

	clear() {
		this.installed = [];
	}
}

class AppState {
	Screen = $state(Screen.START);
	theme = $state(localStorage.getItem("theme") as Theme);
	libraries = new LibraryState();

	constructor() {
		$effect.root(() => {
			$effect(() => {
				document.body.setAttribute("data-color-scheme", this.theme);
				localStorage.setItem("theme", this.theme);
			});
		});
	}
}

export default new AppState();
