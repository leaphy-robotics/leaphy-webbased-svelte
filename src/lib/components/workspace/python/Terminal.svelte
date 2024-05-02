<script lang="ts">
    import { microPythonIO } from "$state/workspace.svelte";
    import { Terminal } from "@xterm/xterm";
    import { onMount } from "svelte";

    const terminal = new Terminal()
    let element: HTMLDivElement
    onMount(() => {
        terminal.open(element)
    })

    const PROMPT = "$ "
    microPythonIO.subscribe(io => {
        if (!io) return

        let line = ''
        let historyPosition = 0
        let history = [line]
        let pos = 0

        function render() {
            if (io.running) return
            terminal.write(`\x1b[2K\r${PROMPT}${line}`)

            // move cursor back to pos
            const virtPos = line.length - pos
            if (virtPos === 0) return
            terminal.write(`\x1b[${virtPos}D`)
        }
        render()

        terminal.onData(data => {
            switch (data) {
                case '\x1b[D': {
                    pos--
                    break
                }
                case '\x1b[C': {
                    pos++
                    break
                }
                case '\x1b[A': {
                    historyPosition--
                    if (historyPosition < 0) historyPosition = 0
                    line = history[historyPosition]

                    break
                }
                case '\x1b[B': {
                    historyPosition++
                    if (historyPosition >= history.length) {
                        historyPosition = history.length - 1
                    }
                    line = history[historyPosition]

                    break
                }
                case '\u007f': {
                    line = line.substring(0, pos-1) + line.substring(pos)
                    pos--

                    break
                }
                case '\u0003': {
                    terminal.write("^C\n")
                    line = ''
                    pos = 0

                    break
                }
                case '\r': {
                    terminal.write('\r\n')

                    const events = io.runCode(line)
                    line = ''

                    events.addEventListener('stdout', (event) => {
                        terminal.write(event.data)
                    })
                    events.addEventListener('stderr', (event) => {
                        terminal.write(`\x1b[31m${event.data}\x1b[0m`)
                    })
                    events.addEventListener('done', render)

                    historyPosition = history.length
                    history.push('')

                    break
                }
                default: {
                    if (data.length !== 1 || data.charCodeAt(0) < 32 || data.charCodeAt(0) > 126) {
                        console.log(data)
                        break
                    }

                    line = line.substring(0, pos) + data + line.substring(pos)
                    history[historyPosition] = line
                    pos++
                }
            }
            
            render()
        })
    })
</script>

<div class="terminal" bind:this={element}></div>

<style>
    .terminal {
        height: 300px;
    }
</style>
