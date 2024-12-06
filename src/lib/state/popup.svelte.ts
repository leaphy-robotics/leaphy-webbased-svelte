import Credits from "$components/core/popups/popups/Credits.svelte";
import LanguageSelector from "$components/core/popups/popups/LanguageSelector.svelte";
import type { ComponentType } from "svelte";
import { writable } from "svelte/store";

export enum Anchor {
	TopLeft = "0 0",
	Center = "-50% -50%",
}

interface Popup {
	component: ComponentType;
	data: Record<string, any>;
	allowInteraction: boolean;
}

export interface PopupState {
	id: string;
	popup: Popup;
	position: { x: number; y: number };
	onclose: (value: any) => void;
	anchor: Anchor;
}

function createPopups() {
	const { subscribe, update, set } = writable<PopupState[]>([]);

	return {
		subscribe,
		open(popup: Popup, initialState?: Partial<PopupState>) {
			let onclose: (value: any) => void;
			const promise = new Promise<any>((resolve) => (onclose = resolve));
			const state: PopupState = {
				id: crypto.randomUUID(),
				position: { x: 0, y: 0 },
				popup,
				onclose,
				anchor: Anchor.Center,
				...initialState,
			};
			update((popups) => {
				if (
					popups.find(
						(popup) => popup.popup.component === state.popup.component,
					)
				) {
					onclose(undefined);
					return popups;
				}

				return [...popups, state];
			});

			return promise;
		},
		move(popup: string, position: { x: number; y: number }) {
			update((popups) =>
				popups.map((e) => (e.id === popup ? { ...e, position } : e)),
			);
		},
		close(popup: string, value?: any) {
			update((popups) =>
				popups.filter((e) => {
					if (e.id !== popup) return true;

					e.onclose(value);
					return false;
				}),
			);
		},
		clear() {
			set([]);
		},
	};
}

export const popups = createPopups();

export async function setup() {
	if (!localStorage.getItem("language")) {
		await popups.open({
			component: LanguageSelector,
			data: {},
			allowInteraction: false,
		});
	}

	if (!localStorage.getItem("credits")) {
		await popups.open({
			component: Credits,
			data: {},
			allowInteraction: false,
		});
	}
}
