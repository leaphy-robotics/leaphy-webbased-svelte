import { writable } from "svelte/store";
import type { RobotListing } from "$domain/robots";
import Start from "$components/start/Start.svelte";
import Workspace from "$components/workspace/Workspace.svelte";
import type { ComponentType } from "svelte";

export const Screen = {
    START: Start,
    WORKSPACE: Workspace,
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

export const theme = writable<Theme>(
    (localStorage.getItem("theme") as Theme) || Theme.LIGHT,
);
theme.subscribe((theme) => {
    document.body.setAttribute("data-color-scheme", theme);
    localStorage.setItem("theme", theme);
});

function createLibraryState() {
    const { subscribe, set } = writable<Library[]>([]);

    return {
        subscribe,
        async query() {
            const res = await fetch(
                "https://downloads.arduino.cc/libraries/library_index.json",
            );
            const json = await res.json();

            const libraries: Record<string, Library> = {};
            json.libraries.forEach((lib) => {
                if (!libraries[lib.name]) {
                    libraries[lib.name] = {
                        name: lib.name,
                        author: lib.author,
                        paragraph: lib.paragraph?.replace(
                            /<\/?br ?\/?>/g,
                            "\n",
                        ),
                        versions: [],
                    };
                }

                libraries[lib.name].versions.push(lib.version);
            });
            Object.values(libraries).forEach((library) => {
                library.versions.sort((a, b) =>
                    b.localeCompare(a, undefined, { numeric: true }),
                );
            });

            set(Object.values(libraries));
        },
    };
}

export const screen = writable<ComponentType>(Screen.START);
export const selected = writable<RobotListing | null>(null);
export const libraries = createLibraryState();
