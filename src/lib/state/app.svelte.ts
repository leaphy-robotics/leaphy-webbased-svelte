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
  LIGHT = 'light',
  DARK = 'dark',
}

export const theme = writable<Theme>(localStorage.getItem('theme') as Theme || Theme.LIGHT)
theme.subscribe(theme => {
  document.body.setAttribute('data-color-scheme', theme)
  localStorage.setItem('theme', theme)
})

class AppState {
  screen = $state<ComponentType>(Screen.START);
  selected = $state<RobotListing | null>(null);
}

export default new AppState();
