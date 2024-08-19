<script lang="ts">
import defaultProgram from "$assets/default-program.json?raw";
import Warning from "$components/core/popups/popups/Warning.svelte";
import Button from "$components/ui/Button.svelte";
import ChipSelect from "$components/ui/ChipSelect.svelte";
import ListSelect from "$components/ui/ListSelect.svelte";
import { isCompatible } from "$domain/blockly/blockly";
import { type RobotDevice, type Selector, getSelector } from "$domain/robots";
import { workspace } from "$state/blockly.svelte";
import { type PopupState, popups } from "$state/popup.svelte";
import { Mode, Prompt, handle, mode, robot } from "$state/workspace.svelte";
import { port } from "$state/workspace.svelte";
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import type { WorkspaceSvg } from "blockly";
import * as Blockly from "blockly";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import { type Writable, get } from "svelte/store";

interface Props {
	connectOverride: boolean;
}

const { connectOverride }: Props = $props();
const { board } = port;

const categories = getSelector($robot) as Selector[];
const categoriesFilter = $derived(
	categories.map((cat) => [cat.name, cat] as [string, Selector]),
);
let category = $state(
	categories.find((cat) =>
		cat.robots.find((robot) => $state.is(robot, $robot)),
	),
);

const values = $derived(
	category.robots.map((robot) => [robot.name, robot] as [string, RobotDevice]),
);

const popupState = getContext<Writable<PopupState>>("state");
function start() {
	window._paq.push(["trackEvent", "SelectRobot", $robot.name]);
	popups.close($popupState.id);
}

board.subscribe((board) => {
	if (!connectOverride || !board) return;

	const robotDevice = get(robot);
	const robotType = getSelector(robotDevice)
		.find((category) =>
			category.robots.find((robot) => $state.is(robot, robotDevice)),
		)
		.robots.find((robot) => robot.board === board.board);

	if (robotType) robot.set(robotType);
});

const warning = $derived(
	$board && $robot && $board.board !== $robot.board
		? $_("INVALID_ROBOT", {
				values: { robot: $robot.name, board: $board.name },
			})
		: undefined,
);

function checkEnabled(robot: RobotDevice): boolean {
	if ($mode !== Mode.BLOCKS) return true;

	return $workspace ? isCompatible($workspace as WorkspaceSvg, robot) : true;
}

async function disabledSelect() {
	const value = await popups.open({
		component: Warning,
		data: {
			title: "CLEAR_PROJECT",
			message: "CLEAR_PROJECT_DESC",
			showCancel: true,
		},
		allowInteraction: false,
	});
	if (!value) return false;

	Blockly.serialization.workspaces.load(JSON.parse(defaultProgram), $workspace);
	handle.set(undefined);
	return true;
}
</script>

<div class="content">
	<Button onclick="{() => port.connect(Prompt.ALWAYS)}" mode="secondary" icon="{faUsb}" name={$port ? $board?.name || $_("UNKNOWN_BOARD") : $_("NOT_CONNECTED")} bold="{!!$port}" large />
	{#if categories.length > 1}
		<ChipSelect options="{categoriesFilter}" bind:value={category} />
	{/if}
	<ListSelect {warning} options="{values}" {checkEnabled} disabledText={$_("INCOMPATIBLE_PROJECT")} {disabledSelect} bind:value={$robot} />
	<Button onclick="{start}" mode="primary" name={$_("CONTINUE")} center bold />
</div>

<style>
	.content {
		padding: 20px;
		display: flex;
		flex-direction: column;
		min-width: 400px;
		text-align: center;
		gap: 15px;
	}
</style>
