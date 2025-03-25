<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from "svelte";
    import { Terminal } from "@xterm/xterm";
    import { FitAddon } from "@xterm/addon-fit";
    import { microPythonIO, microPythonRun } from "$state/workspace.svelte";
    import { get } from "svelte/store";
  
    const dispatch = createEventDispatcher();
  
    const PROMPT = "$ ";
    let terminal: Terminal;
    let fitAddon: FitAddon;
    let terminalContainer: HTMLDivElement;
  
    let line = "";
    let history = [""];
    let historyPosition = 0;
    let pos = 0;
  
    function renderPrompt() {
      if (get(microPythonIO)?.running) return;
      terminal.write(`\x1b[2K\r${PROMPT}${line}`);
      const virtPos = line.length - pos;
      if (virtPos > 0) {
        terminal.write(`\x1b[${virtPos}D`);
      }
    }
  
    onMount(() => {
      terminal = new Terminal({
        cursorBlink: true,
        theme: { background: "#0000", foreground: "#fff" }
      });
      fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(terminalContainer);
      fitAddon.fit();
  
      terminal.write(PROMPT);
  
      const unsubscribeIO = microPythonIO.subscribe((io) => {
        if (!io) return;
        renderPrompt();
  
        terminal.onData((data: string) => {
          if (io.running) return;
  
          switch (data) {
            case "\x1b[D": // left
              pos = Math.max(0, pos - 1);
              break;
            case "\x1b[C": // right
              pos = Math.min(line.length, pos + 1);
              break;
            case "\x1b[A": // up
              historyPosition = Math.max(0, historyPosition - 1);
              line = history[historyPosition];
              pos = line.length;
              break;
            case "\x1b[B": // down
              historyPosition = Math.min(history.length - 1, historyPosition + 1);
              line = history[historyPosition];
              pos = line.length;
              break;
            case "\u007f": // Backspace
              if (pos > 0) {
                line = line.slice(0, pos - 1) + line.slice(pos);
                pos--;
              }
              break;
            case "\u0003": // Ctrl+C
              terminal.write("^C\r\n");
              line = "";
              pos = 0;
              break;
            case "\r": // Enter
              terminal.write("\r\n");
              history.push(line);
              historyPosition = history.length;
              if (line.trim() !== "") {
                const events = io.runCode(line);
                events.addEventListener("stdout", (event: any) => {
                  terminal.write(event.data);
                });
                events.addEventListener("stderr", (event: any) => {
                  terminal.write(`\x1b[31m${event.data}\x1b[0m`);
                });
                events.addEventListener("done", renderPrompt);
              } else {
                renderPrompt();
              }
              line = "";
              pos = 0;
              return;
            default:
              if (
                data.length === 1 &&
                data.charCodeAt(0) >= 32 &&
                data.charCodeAt(0) <= 126
              ) {
                line = line.slice(0, pos) + data + line.slice(pos);
                pos++;
              }
          }
          renderPrompt();
        });
      });
  
      const unsubscribeRun = microPythonRun.subscribe((events) => {
        if (!events) return;
        terminal.write("\r\n");
        events.addEventListener("stdout", (event: any) => {
          terminal.write(event.data);
        });
        events.addEventListener("stderr", (event: any) => {
          terminal.write(`\x1b[31m${event.data}\x1b[0m`);
        });
        events.addEventListener("done", renderPrompt);
      });
  
      onDestroy(() => {
        unsubscribeIO();
        unsubscribeRun();
        terminal.dispose();
      });
    });
  </script>
  
  <div class="popup">
    <div class="header">
      <h2>Terminal Monitor</h2>
      <button on:click={() => dispatch("close")}>Close</button>
    </div>
    <div class="terminal-container" bind:this={terminalContainer}></div>
  </div>
  
  <style>
    .popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      max-width: 800px;
      height: 500px;
      background: #000;
      color: #fff;
      display: flex;
      flex-direction: column;
      z-index: 1000;
      border: 1px solid #333;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: #333;
    }
    .terminal-container {
      flex: 1;
    }
    button {
      background: #444;
      border: none;
      color: #fff;
      padding: 5px 10px;
      cursor: pointer;
    }
    button:hover {
      background: #555;
    }
  </style>
  