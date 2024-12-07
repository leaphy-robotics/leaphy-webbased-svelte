<script lang="ts">
import defaultProgram from "$assets/default-program.py?raw";
import Prompt from "$components/core/popups/popups/Prompt.svelte";
import CodeEditor from "$components/ui/CodeEditor.svelte";
import Tree from "$components/ui/Tree.svelte";
import type { Tree as TreeType } from "$components/ui/Tree.types";
import { FileHandle, PythonHandle } from "$domain/handles";
import PopupState from "$state/popup.svelte";
import WorkspaceState from "$state/workspace.svelte";
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

$effect(() => {
	if (!WorkspaceState.microPythonIO) return;
	if (!WorkspaceState.saveState || WorkspaceState.handle) return;

	(async () => {
		if (!(await WorkspaceState.microPythonIO.fs.exists("main.py"))) {
			await WorkspaceState.microPythonIO.fs.write("main.py", defaultProgram);
		}

		tree = await getTree(WorkspaceState.microPythonIO, "/");
		tree.name = "robot";

		WorkspaceState.code = await WorkspaceState.microPythonIO.fs.read("main.py");
		WorkspaceState.handle = new PythonHandle("main.py");
	})()
})

$effect(() => {
	if (!(WorkspaceState.handle instanceof FileHandle))
		return

	tree = undefined;
})

async function select(tree: string[]) {
	selected = tree;

	await WorkspaceState.handle?.write(WorkspaceState.code);
	const data = await WorkspaceState.microPythonIO.fs.read(tree.join("/"));
	WorkspaceState.code = data.replaceAll("\r\n", "\n");
	console.log(data);
	WorkspaceState.handle = new PythonHandle(tree.join("/"));
}

async function create(path: string[], type: "file" | "folder") {
	const name = await PopupState.open({
		component: Prompt,
		data: {
			name: type === "file" ? "CREATE_FILE" : "CREATE_FOLDER",
			confirm: "OK_VARIABLE",
		},
		allowInteraction: false,
	}) as string;
	if (!name) return;

	const io = WorkspaceState.microPythonIO;
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
		await WorkspaceState.handle?.write(WorkspaceState.code);
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
            <CodeEditor bind:value={WorkspaceState.code} language="python" />
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
