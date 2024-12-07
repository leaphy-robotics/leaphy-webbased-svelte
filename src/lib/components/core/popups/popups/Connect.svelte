<script lang="ts">
import defaultProgram from "$assets/default-program.json?raw";
import Warning from "$components/core/popups/popups/Warning.svelte";
import Button from "$components/ui/Button.svelte";
import ChipSelect from "$components/ui/ChipSelect.svelte";
import ListSelect from "$components/ui/ListSelect.svelte";
import { isCompatible } from "$domain/blockly/blockly";
import { type RobotDevice, type Selector, getSelector } from "$domain/robots";
import BlocklyState from "$state/blockly.svelte";
import PopupsState, { type PopupState } from "$state/popup.svelte";
import WorkspaceState, { Mode } from "$state/workspace.svelte";
import SerialState, { Prompt } from "$state/serial.svelte";
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import * as Blockly from "blockly";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";

interface Props {
	connectOverride: boolean;
}

const { connectOverride }: Props = $props();

const categories = getSelector() as Selector[];
const categoriesFilter = $derived(
	categories.map((cat) => [cat.name, cat] as [string, Selector]),
);
let category = $state(
	categories.find((cat) =>
		cat.robots.find((robot) => robot.id === WorkspaceState.robot.id),
	),
);

const values = $derived(
	category.robots.map((robot) => [robot.name, robot] as [string, RobotDevice]),
);

const popupState = getContext<PopupState>("state");
function start() {
	window._paq.push(["trackEvent", "SelectRobot", WorkspaceState.robot.name]);
	popupState.close();
}

$effect(() => {
	if (!connectOverride || !SerialState.board) return;

	const robotDevice = WorkspaceState.robot;
	const robotType = getSelector()
		.find((category) =>
			category.robots.find((robot) => robot.id === robotDevice.id),
		)
		.robots.find((robot) => robot.board === SerialState.board.board);

	if (robotType) WorkspaceState.robot = robotType;
})

const warning = $derived(
	SerialState.board && WorkspaceState.robot && SerialState.board.board !== WorkspaceState.robot.board
		? $_("INVALID_ROBOT", {
				values: { robot: WorkspaceState.robot.name, board: SerialState.board.name },
			})
		: undefined,
);

function checkEnabled(robot: RobotDevice): boolean {
	if (WorkspaceState.Mode !== Mode.BLOCKS) return true;

	return BlocklyState.workspace ? isCompatible(BlocklyState.workspace, robot) : true;
}

async function disabledSelect() {
	const value = await PopupsState.open({
		component: Warning,
		data: {
			title: "CLEAR_PROJECT",
			message: "CLEAR_PROJECT_DESC",
			showCancel: true,
		},
		allowInteraction: false,
	});
	if (!value) return false;

	Blockly.serialization.workspaces.load(JSON.parse(defaultProgram), BlocklyState.workspace);
	WorkspaceState.handle = undefined;
	return true;
}
</script>

<div class="content">
	<Button onclick={() => SerialState.connect(Prompt.ALWAYS)} mode="secondary" icon={faUsb} name={SerialState.port ? SerialState.board?.name || $_("UNKNOWN_BOARD") : $_("NOT_CONNECTED")} bold={!!SerialState.port} large />
	{#if categories.length > 1}
		<ChipSelect options={categoriesFilter} bind:value={category} />
	{/if}
	<ListSelect {warning} options={values} {checkEnabled} disabledText={$_("INCOMPATIBLE_PROJECT")} {disabledSelect} bind:value={WorkspaceState.Mode} />
	<Button onclick={start} mode="primary" name={$_("CONTINUE")} center bold />
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
