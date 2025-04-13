import Recording from "$components/core/popups/popups/Recording.svelte";
import {io, Socket} from "socket.io-client";
import ErrorPopup from "$components/core/popups/popups/Error.svelte";
import {record} from "rrweb";
import PopupState from "$state/popup.svelte";
import TestMode from "$components/core/popups/popups/TestMode.svelte";
import WorkspaceState, {Mode} from "$state/workspace.svelte";
import {serialization} from "blockly";
import BlocklyState from "$state/blockly.svelte";
import {robots} from "$domain/robots";
import AppState, {Screen} from "$state/app.svelte";

type SuggestNames = { suggestNames: false, names: null } | { suggestNames: true, names: { id: string; name: string }[] }

type Project = {
	id: string
	name: string
	acceptsSubmissions: boolean
	acceptsNewParticipants: boolean
	testMode: boolean
} & SuggestNames

interface Assignment {
	id: string
	name: string
	done: boolean
	autograding: boolean
}

interface Test {
	id: string
	name: string
	assignments: Assignment[]
}

interface AutoGradingResult {
	pass: boolean,
	points: number,
	failReason: string
}

class ChunkRecorder extends EventTarget {
	private events = []

	constructor() {
		super();

		record({
			emit: (event) => {
				this.events.push(event);
			},
		})
		setInterval(() => {
			this.flush()
		}, 10 * 1000)
	}

	flush() {
		this.dispatchEvent(new CustomEvent('chunk', { detail: this.events }))
		this.events = []
	}
}

class RecordingsState {
	project = $state<Project>(null)
	tests = $state<Test[]>([])
	name = $state('')
	recorder = new ChunkRecorder()
	recordingSession = $state<{ abort: () => void, socket: Socket }>(null)
	selectedAssignment = $state<Assignment>(null)
	autoGradingResult = $state<AutoGradingResult>(null)

	private async prepareProject(promise?: Promise<any>) {
		await promise

		this.tests = await fetch(`${import.meta.env.VITE_RECORDINGS_API}/api/projects/${this.project.id}/assignments`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: this.name
			})
		})
			.then(async res => {
				if (!res.ok) {
					const { message } = await res.json()
					PopupState.clear()
					await PopupState.open({
						component: ErrorPopup,
						data: {
							title: "ERROR",
							message,
						},
						allowInteraction: false,
					});
					await this.initializeProject()
				}

				return res.json();
			})
	}

	private async startProject(promise?: Promise<any>, message?: string) {
		if (this.project.testMode) {
			this.selectedAssignment = await PopupState.open({
				component: TestMode,
				data: {
					waitingPromise: this.prepareProject(promise),
					waitingMessage: message || "LOADING_ASSIGNMENTS"
				},
				allowInteraction: false
			}) as Assignment
		}

		this.recordingSession = this.createSession()
	}

	private async initializeProject() {
		this.name = await PopupState.open({
			component: Recording,
			data: {},
			allowInteraction: false,
		}) as string

		await this.startProject()
	}

	private createSession() {
		const socket = io(import.meta.env.VITE_RECORDINGS_API, {
			extraHeaders: {
				project: this.project.id,
				name: this.name,
				assignment: this.selectedAssignment?.id
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
			await this.initializeProject()
		});

		function sendChunk(e: Event) {
			socket.emit("write", {
				data: (e as CustomEvent).detail.map((e) => JSON.stringify(e)).join("\n"),
			})
		}
		this.recorder.addEventListener('chunk', sendChunk)

		return {
			socket,
			abort: () => {
				this.recorder.flush()

				this.recorder.removeEventListener('chunk', sendChunk)
				socket.disconnect()
			}
		}
	}

	async setup() {
		if (import.meta.env.VITE_RECORDINGS_API === undefined) return;

		const urlParams = new URLSearchParams(window.location.search);
		const open = urlParams.get('open');
		if (open) {
			const { robot, content } = await fetch(`${import.meta.env.VITE_RECORDINGS_API}/api/submissions/${open}`)
				.then(res => res.json())

			AppState.Screen = Screen.WORKSPACE
			WorkspaceState.open(robot, content)
		}

		const [project] = location.hostname.split(
			import.meta.env.VITE_RECORDINGS_ADDRESS,
		);
		if (
			project &&
			location.hostname.endsWith(import.meta.env.VITE_RECORDINGS_ADDRESS)
		) {
			try {
				const res = await fetch(
					`${import.meta.env.VITE_RECORDINGS_API}/api/projects/${project}`,
				);
				this.project = await res.json()
			} catch (e) {
				window.location.replace(import.meta.env.VITE_BACKEND_URL);
				return;
			}

			await this.initializeProject()
		}
	}

	async submit() {
		this.recordingSession.abort()

		let content = WorkspaceState.code;
		if (WorkspaceState.Mode === Mode.BLOCKS) {
			content = JSON.stringify(
				serialization.workspaces.save(BlocklyState.workspace),
			);
		}

		let robot = WorkspaceState.robot.id;
		if (WorkspaceState.Mode === Mode.ADVANCED) robot = "ino";
		if (WorkspaceState.Mode === Mode.PYTHON) robot = "py";

		await this.startProject(
			fetch(`${import.meta.env.VITE_RECORDINGS_API}/api/projects/${this.project.id}/assignments/${this.selectedAssignment.id}/submit`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: this.name,
					robot, content
				})
			})
				.then(res => res.json())
				.then(res => this.autoGradingResult = res.autoGradingResult || null),
			this.selectedAssignment.autograding ? "GRADING" : "SUBMITTING"
		)
	}
}

export default new RecordingsState()
