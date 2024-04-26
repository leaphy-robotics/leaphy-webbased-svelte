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
}

function createPopups() {
  const { subscribe, update } = writable<PopupState[]>([]);

  return {
    subscribe,
    open(popup: Popup) {
      const state: PopupState = {
        id: crypto.randomUUID(),
        position: { x: 0, y: 0 },
        popup,
      };
      update((popups) => [...popups, state]);

      return state;
    },
    move(popup: string, position: { x: number; y: number }) {
      update((popups) =>
        popups.map((e) => (e.id === popup ? { ...e, position } : e)),
      );
    },
    close(popup: string) {
      update((popups) => popups.filter(e => e.id !== popup))
    }
  };
}

export const popups = createPopups();
