<script lang="ts">
import defaultProgram from "$assets/default-program.py?raw";
import CodeEditor from "$components/ui/CodeEditor.svelte";
import Tree from "$components/ui/Tree.svelte";
import type { Tree as TreeType } from "$components/ui/Tree.types";
import { PythonHandle } from "$domain/handles";
import { code, handle, microPythonIO } from "$state/workspace.svelte";
import { get } from "svelte/store";
import type MicroPythonIO from "../../../micropython";
import Terminal from "./Terminal.svelte";

let tree = $state<TreeType | undefined>(undefined);
let selected = $state<string[]>(["main.py"]);

async function getTree(io: MicroPythonIO, folder: string): Promise<TreeType> {
	let items = await io.fs.ls(folder);
	items = items.sort((a, b) => {
		if (!a.isDir && b.isDir) return 1;
		if (a.isDir && !b.isDir) return -1;

		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;

		return 0;
	});

	let contents: (string | TreeType)[] = [];
	for (const item of items) {
		if (item.isDir)
			contents.push(
				await getTree(io, `${folder === "/" ? "" : folder}/${item.name}`),
			);
		else contents.push(item.name);
	}

	return {
		name: folder.split("/").at(-1),
		contents,
	};
}

microPythonIO.subscribe(async (io) => {
	if (!io) return;

	if (!(await io.fs.exists("main.py"))) {
		await io.fs.write("main.py", defaultProgram);
	}

	tree = await getTree(io, "/");
	tree.name = "robot";

	code.set(await io.fs.read("main.py"));
	handle.set(new PythonHandle("main.py"));
});

async function select(tree: string[]) {
	selected = tree;

	const data = await get(microPythonIO).fs.read(tree.join("/"));
	code.set(data);
	handle.set(new PythonHandle(tree.join("/")));
}
</script>

<div class="environment">
    <div class="editor">
        {#if tree}
            <div class="files">
                <Tree {tree} {selected} indent={10} onselect={select} />
            </div>
        {/if}
        <div class="code">
            <CodeEditor bind:value={$code} language="python" />
        </div>
    </div>
    <Terminal />
</div>

<style>
    .environment {
        display: flex;
        flex-direction: column;
        height: var(--full-height);
        position: relative;
    }
    .editor {
        display: flex;
        flex: 1;
    }
    .files {
        min-width: 300px;
        position: relative;
        padding-top: 5px;
    }
    .code {
        flex: 1;
    }
</style>
