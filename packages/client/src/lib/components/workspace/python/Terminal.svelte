<script lang="ts">
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { onMount } from "svelte";
import WorkspaceState from "$state/workspace.svelte";

const terminal = new Terminal();
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);

let element: HTMLDivElement;
onMount(() => {
	terminal.open(element);
	fitAddon.fit();
});

let line = "";
let historyPosition = 0;
const history = [line];
let pos = 0;

function render() {
	if (WorkspaceState.microPythonIO.running) return;
	terminal.write(`\x1b[2K\r${PROMPT}${line}`);

	// move cursor back to pos
	const virtPos = line.length - pos;
	if (virtPos === 0) return;
	terminal.write(`\x1b[${virtPos}D`);
}

const PROMPT = "$ ";
$effect(() => {
	if (!WorkspaceState.microPythonIO) return;
	render();

	terminal.onData((data) => {
		if (
			WorkspaceState.microPythonIO.running ||
			WorkspaceState.microPythonRun === undefined
		) {
			return;
		}

		switch (data) {
			case "\x1b[D": {
				pos--;
				if (pos < 0) pos = 0;

				break;
			}
			case "\x1b[C": {
				pos++;
				if (pos > line.length) pos = line.length;

				break;
			}
			case "\x1b[A": {
				historyPosition--;
				if (historyPosition < 0) historyPosition = 0;
				line = history[historyPosition];
				pos = line.length;
				if (pos < 0) pos = 0;

				break;
			}
			case "\x1b[B": {
				historyPosition++;
				if (historyPosition >= history.length) {
					historyPosition = history.length - 1;
				}
				line = history[historyPosition];

				pos = line.length;
				if (pos < 0) pos = 0;

				break;
			}
			case "\u007f": {
				line = line.substring(0, pos - 1) + line.substring(pos);

				pos--;
				if (pos < 0) pos = 0;

				break;
			}
			case "\u0003": {
				terminal.write("^C\n");
				line = "";
				pos = 0;

				break;
			}
			case "\r": {
				terminal.write("\r\n");
				historyPosition = history.length;
				history.push("");

				if (!line) break;
				const events = WorkspaceState.microPythonIO.runCode(line);
				line = "";
				pos = 0;

				events.addEventListener("stdout", (event) => {
					terminal.write(event.data);
				});
				events.addEventListener("stderr", (event) => {
					terminal.write(`\x1b[31m${event.data}\x1b[0m`);
				});
				events.addEventListener("done", render);

				break;
			}
			default: {
				if (
					data.length !== 1 ||
					data.charCodeAt(0) < 32 ||
					data.charCodeAt(0) > 126
				) {
					console.log(data);
					break;
				}

				line = line.substring(0, pos) + data + line.substring(pos);
				history[historyPosition] = line;
				pos++;
			}
		}

		render();
	});
});

$effect(() => {
	$inspect(WorkspaceState.microPythonRun);
	if (!WorkspaceState.microPythonRun) return;

	terminal.write("\r\n");
	const stdout_handler = (event) => {
		terminal.write(event.data);
	};
	const stderr_handler = (event) => {
		terminal.write(`\x1b[31m${event.data}\x1b[0m`);
	};
	const restart_handler = (event) => {
		event.source.removeEventListener("stdout", stdout_handler);
		event.source.removeEventListener("stderr", stderr_handler);
		event.source.removeEventListener("done", render);
		event.source.removeEventListener("restart", restart_handler);
	};
	WorkspaceState.microPythonRun.addEventListener("stdout", stdout_handler);
	WorkspaceState.microPythonRun.addEventListener("stderr", stderr_handler);
	WorkspaceState.microPythonRun.addEventListener("done", render);
	WorkspaceState.microPythonRun.addEventListener("restart", restart_handler);
});
</script>

<div class="p-2.5 bg-black">
    <div class="h-[300px]" bind:this={element}></div>
</div>
