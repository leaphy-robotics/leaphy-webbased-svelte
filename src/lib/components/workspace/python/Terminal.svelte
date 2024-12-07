<script lang="ts">
import WorkspaceState from "$state/workspace.svelte";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { onMount } from "svelte";

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
		if (WorkspaceState.microPythonIO.running) {
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
	if (!WorkspaceState.microPythonRun) return;

	terminal.write("\r\n");
	WorkspaceState.microPythonRun.addEventListener("stdout", (event) => {
		terminal.write(event.data);
	});
	WorkspaceState.microPythonRun.addEventListener("stderr", (event) => {
		terminal.write(`\x1b[31m${event.data}\x1b[0m`);
	});
	WorkspaceState.microPythonRun.addEventListener("done", render);
});
</script>

<div class="container">
    <div class="terminal" bind:this={element}></div>
</div>

<style>
    .container {
        padding: 10px;
        background: #000;
    }
    .terminal {
        height: 300px;
    }
</style>
