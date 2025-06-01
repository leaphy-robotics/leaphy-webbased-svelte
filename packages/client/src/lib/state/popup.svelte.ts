import BrowserNotSupported from "$components/core/popups/popups/BrowserNotSupported.svelte";
import Credits from "$components/core/popups/popups/Credits.svelte";
import LanguageSelector from "$components/core/popups/popups/LanguageSelector.svelte";
import type { Component } from "svelte";
import {projectDB} from "$domain/storage";
import Restore from "$components/core/popups/popups/Restore.svelte";

export enum Anchor {
	TopLeft = "0 0",
	Center = "-50% -50%",
}

interface Popup {
	component: Component;
	data: Record<string, any>;
	allowInteraction: boolean;

	position?: { x: number; y: number };
	anchor?: Anchor;
}

export class PopupState {
	id = $state<number>();

	component = $state<Component>();
	data = $state<Record<string, any>>();
	allowInteraction = $state<boolean>();

	position = $state({ x: 0, y: 0 });
	onclose: () => void = undefined;
	anchor = $state<Anchor>(Anchor.Center);

	constructor(
		id: number,
		props: Popup,
		public close: (value?: any) => void,
	) {
		this.id = id;

		this.component = props.component;
		this.data = props.data;
		this.allowInteraction = props.allowInteraction;

		if (props.position) this.position = props.position;
		if (props.anchor) this.anchor = props.anchor;
	}
}

class PopupsState {
	popups = $state<PopupState[]>([]);
	count = 0;

	getID() {
		this.count++;
		if (this.count > 1000) this.count = 0;

		return this.count;
	}

	open(props: Popup) {
		return new Promise((resolve) => {
			if (this.popups.find((popup) => popup.component === props.component)) {
				resolve(undefined);
				return;
			}

			const id = this.getID();
			this.popups.push(
				new PopupState(id, props, (value: any) => {
					this.popups = this.popups.filter((popup) => popup.id !== id);
					resolve(value);
				}),
			);
		});
	}

	async setup() {
		if (!localStorage.getItem("language")) {
			await this.open({
				component: LanguageSelector,
				data: {},
				allowInteraction: false,
			});
		}

		if (!localStorage.getItem("credits")) {
			await this.open({
				component: Credits,
				data: {},
				allowInteraction: false,
			});
		}

		if (
			!localStorage.getItem("dontShowBrowserNotSupported") &&
			navigator.serial === undefined &&
			navigator.usb === undefined
		) {
			await this.open({
				component: BrowserNotSupported,
				data: {},
				allowInteraction: false,
			});
		}

		const fileSaves = await projectDB.saves.toArray()
		const tempSaves = await projectDB.tempSaves.toArray();

		let saves = [
			...fileSaves.map(e => ({ ...e, type: 'file' as 'file', id: `file-${e.id}` })),
			...tempSaves.map(e => ({ ...e, type: 'temp' as 'temp', id: `temp-${e.id}` }))
		];

		saves = saves.sort((a, b) => {
			// Check for file-content linking relationship first (overrides date sorting)

			// If 'a' is a temp save linked to 'b' (file save), 'a' should come after 'b'
			if (a.type === 'temp' && a.fileSave && b.type === 'file' && b.id === `file-${a.fileSave}`) {
				return 1; // a comes after b
			}

			// If 'b' is a temp save linked to 'a' (file save), 'b' should come after 'a'
			if (b.type === 'temp' && b.fileSave && a.type === 'file' && a.id === `file-${b.fileSave}`) {
				return -1; // b comes after a
			}

			// For non-linked items, sort by date (newest first)
			return b.date - a.date;
		});

		saves = saves.slice(0, 5)

		if (tempSaves.length > 0) {
			await this.open({
				component: Restore,
				data: { saves },
				allowInteraction: false
			})
		}
	}

	clear() {
		this.popups = [];
	}
}

export default new PopupsState();
