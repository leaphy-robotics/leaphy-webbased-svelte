import Credits from "$components/core/popups/popups/Credits.svelte";
import LanguageSelector from "$components/core/popups/popups/LanguageSelector.svelte";
import type { ComponentType } from "svelte";
import { writable } from "svelte/store";

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
}

function createPopups() {
	const { subscribe, update } = writable<PopupState[]>([]);

	return {
		subscribe,
		open(popup: Popup) {
			let onclose: (value: any) => void;
			const promise = new Promise<any>((resolve) => (onclose = resolve));
			const state: PopupState = {
				id: crypto.randomUUID(),
				position: { x: 0, y: 0 },
				popup,
				onclose,
			};
			update((popups) => [...popups, state]);

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
