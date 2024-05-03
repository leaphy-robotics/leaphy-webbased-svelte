<script lang="ts">
import defaultProgram from "$assets/default-program.py?raw";
import Prompt from "$components/core/popups/popups/Prompt.svelte";
import CodeEditor from "$components/ui/CodeEditor.svelte";
import Tree from "$components/ui/Tree.svelte";
import type { Tree as TreeType } from "$components/ui/Tree.types";
import { FileHandle, PythonHandle } from "$domain/handles";
import { popups } from "$state/popup.svelte";
import {
	code,
	handle,
	microPythonIO,
	saveState,
} from "$state/workspace.svelte";
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
	if (!get(saveState) || get(handle)) return;

	if (!(await io.fs.exists("main.py"))) {
		await io.fs.write("main.py", defaultProgram);
	}

	tree = await getTree(io, "/");
	tree.name = "robot";

	code.set(await io.fs.read("main.py"));
	handle.set(new PythonHandle("main.py"));
});

handle.subscribe((handle) => {
	if (handle instanceof FileHandle) tree = undefined;
});

async function select(tree: string[]) {
	selected = tree;

	await get(handle)?.write(get(code));
	const data = await get(microPythonIO).fs.read(tree.join("/"));
	code.set(data.replaceAll("\r\n", "\n"));
	console.log(data);
	handle.set(new PythonHandle(tree.join("/")));
}

async function create(path: string[], type: "file" | "folder") {
	const name = await popups.open({
		component: Prompt,
		data: {
			name: type === "file" ? "CREATE_FILE" : "CREATE_FOLDER",
			confirm: "OK_VARIABLE",
		},
		allowInteraction: false,
	});
	if (!name) return;

	const io = get(microPythonIO);
	const parent = path.reduce(
		(prev, curr) => prev.contents.find((e) => (e as TreeType).name === curr),
		tree,
	) as TreeType;

	if (type === "folder") {
		io.fs.mkdir(`${path.join("/")}/${name}`);

		parent.contents.push({
			name,
			contents: [],
		});
	}
	if (type === "file") {
		await get(handle)?.write(get(code));
		io.fs.write(`${path.join("/")}/${name}.py`, defaultProgram);

		parent.contents.push(`${name}.py`);
		selected = [...path, name];
	}
}
</script>

<div class="environment">
    <div class="editor">
        {#if tree}
            <div class="files">
                <Tree {tree} {selected} indent={10} onselect={select} oncreate={create} />
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
