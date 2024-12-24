import BrowserNotSupported from "$components/core/popups/popups/BrowserNotSupported.svelte";
import Credits from "$components/core/popups/popups/Credits.svelte";
import LanguageSelector from "$components/core/popups/popups/LanguageSelector.svelte";
import Recording from "$components/core/popups/popups/Recording.svelte";
import type { Component } from "svelte";
import { requestRecording } from "../recording";

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

		const [project] = location.hostname.split(
			import.meta.env.VITE_RECORDINGS_ADDRESS,
		);
		if (
			project &&
			location.hostname.endsWith(import.meta.env.VITE_RECORDINGS_ADDRESS)
		) {
			let config: any;
			try {
				const res = await fetch(
					`${import.meta.env.VITE_RECORDINGS_API}/api/projects/${project}`,
				);
				config = await res.json();
			} catch (e) {
				window.location.replace(import.meta.env.VITE_BACKEND_URL);
				return;
			}

			await requestRecording(config);
		}
	}

	clear() {
		this.popups = [];
	}
}

export default new PopupsState();
