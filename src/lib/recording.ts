import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import Recording from "$components/core/popups/popups/Recording.svelte";
import PopupState from "$state/popup.svelte";
import { record } from "rrweb";
import { io } from "socket.io-client";

export async function requestRecording(project: { id: string }) {
	const name = (await PopupState.open({
		component: Recording,
		data: project,
		allowInteraction: false,
	})) as string;
	setupRecording(project, name);
}

export default function setupRecording(project: { id: string }, name: string) {
	const socket = io(import.meta.env.VITE_RECORDINGS_API, {
		extraHeaders: {
			project: project.id,
			name,
		},
	});
	socket.on("error", async (msg) => {
		socket.disconnect();
		await PopupState.open({
			component: ErrorPopup,
			data: {
				title: "ERROR",
				message: msg,
			},
			allowInteraction: false,
		});
		await requestRecording(project);
	});

	let events = [];
	record({
		emit(event) {
			events.push(event);
		},
	});

	function send() {
		console.log("send");
		socket.emit("write", {
			data: events.map((e) => JSON.stringify(e)).join("\n"),
		});
		events = [];
	}

	socket.on("connect", () => {
		setInterval(send, 10 * 1000);
	});
}
