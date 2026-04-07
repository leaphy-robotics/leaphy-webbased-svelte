<script lang="ts">
import { findStatementPositions } from "$components/workspace/blocks/statementPositions";
import Code from "$components/workspace/panels/Code.svelte";
import { RobotType } from "$domain/robots.types";
import BlocklyState from "$state/blockly.svelte";
import SerialState from "$state/serial.svelte";
import WorkspaceState from "$state/workspace.svelte";
import { faCaretSquareLeft } from "@fortawesome/free-solid-svg-icons";
import { arduino, python } from "@leaphy-robotics/leaphy-blocks";
import * as monaco from "monaco-editor";
import Fa from "svelte-fa";

const SPACING = 10;

let hints = $state<
	{
		code: string;
		lineWidth: number;
		x: number;
		y: number;
		color: string;
		lines: [number, number];
	}[][]
>([]);

function getCodeGenerator(): typeof python | typeof arduino {
	if (WorkspaceState.robot.type === RobotType.L_MICROPYTHON) {
		return python;
	}

	arduino.boardType = SerialState.board?.id || WorkspaceState.robot.board;
	arduino.robotType = WorkspaceState.robot.id;
	return arduino;
}

function getLines(
	code: string,
	character: number,
	endCharacter: number,
): [number, number] {
	const items = code.split("\n");
	let i = 0;
	let line = 0;

	let startLine = -1;

	for (const item of items) {
		if (!item.includes("BLOCK_") && !item.includes("END_BLOCK")) {
			line++;
		}

		i += item.length + 1;
		if (i >= character && startLine === -1) startLine = line;
		if (i >= endCharacter) break;
	}

	return [startLine + 1, line];
}

$effect(() => {
	if (!BlocklyState.workspace) return;

	BlocklyState.workspace.addChangeListener(() => {
		const blocks: Record<string, [string, [number, number]][]> = {};

		const generator = getCodeGenerator();
		generator.STATEMENT_PREFIX = "BLOCK_%1\n";
		generator.STATEMENT_SUFFIX = "END_BLOCK\n";
		const program = generator.workspaceToCode(BlocklyState.workspace);
		generator.STATEMENT_PREFIX = "";
		generator.STATEMENT_SUFFIX = "";

		program.matchAll(/BLOCK_'(.*)'\n((.|\n)*?)END_BLOCK/gm).forEach((match) => {
			const [section, block, code] = match;
			if (!blocks[block]) {
				blocks[block] = [];
			}

			let trimmedCode = code.trimEnd();
			if (trimmedCode === "") {
				trimmedCode = code;
			}

			blocks[block].push([
				trimmedCode,
				getLines(program, match.index, match.index + section.length),
			]);
		});

		hints = Object.entries(blocks).map(([blockId, statements]) => {
			const block = BlocklyState.workspace.getBlockById(blockId);
			if (!block.isEnabled()) return [];

			const rect = block.pathObject.svgPath.getBoundingClientRect();
			const parentRect = block
				.getRootBlock()
				.getSvgRoot()
				.getBoundingClientRect();
			const statementPositions = findStatementPositions(
				block.pathObject.svgPath.getAttribute("d"),
			);
			const color = block.getColour();

			return statements
				.map(([statement, lines], index) => {
					let code = statement.trimStart();

					const position = statementPositions[index];
					if (!position) return;

					const offset =
						(statement.length - code.length) * SPACING + SPACING * 3;
					const lineWidth =
						parentRect.x + parentRect.width - (rect.x + rect.width) + offset;
					const x = parentRect.x + parentRect.width + offset;
					const y =
						rect.y +
						(position.top + position.height / 2) *
							BlocklyState.workspace.getScale();

					if (code.startsWith("//")) {
						code = code.split("\n").slice(1).join("\n");
					}

					return { x, y, lineWidth, code, color, lines };
				})
				.filter((e) => !!e);
		});
	});
});

function highlightStatement(lines: [number, number]) {
	const model = WorkspaceState.codeEditor?.getModel();
	WorkspaceState.codeEditor?.setSelection(
		new monaco.Selection(
			lines[0],
			1,
			lines[1],
			model.getLineMaxColumn(lines[1]),
		),
	);
}
</script>

{#if WorkspaceState.SidePanel === Code}
	{#each hints as block}
		{#each block as hint, index}
		<div class="hint" onclick={() => highlightStatement(hint.lines)} style:top={`${hint.y}px`} style:left={`${hint.x}px`} style:--color={hint.color}>
			<div class="line" style:width={`${hint.lineWidth}px`}>
				<svg width="100%" height="8" xmlns="http://www.w3.org/2000/svg">
					<line
						x1="0" y1="5" x2="100%" y2="4"
						stroke={hint.color}
						stroke-width="4"
						stroke-linecap="round"
						stroke-dasharray="4 10"
					/>
				</svg>
			</div>
			<div class="text">
				{#if hint.code === '' && WorkspaceState.robot.type === RobotType.L_MICROPYTHON && index === block.length - 1}
					<Fa icon={faCaretSquareLeft} />
				{/if}
				{hint.code}
			</div>
		</div>
		{/each}
	{/each}
{/if}

<style>
	.hint {
		position: fixed;
		font-size: 16px;
		display: flex;
		align-items: center;
		translate: 0 -50%;
		color: var(--color);
		font-family: Menlo, Monaco, "Courier New", monospace;

		cursor: pointer;
	}

	.text {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		max-width: 500px;
		-webkit-text-stroke: 0.3px black;
	}

	.line {
		position: absolute;
		right: 100%;
		padding-left: 5px;
		padding-right: 5px;

		height: 100%;
	}
</style>
