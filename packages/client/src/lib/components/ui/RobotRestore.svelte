<script lang="ts">
import RobotRestoreState from "$state/robotRestore.svelte";
import { Prompt } from "$state/serial.svelte";
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import { onMount } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import { Circle } from "svelte-loading-spinners";

interface Props {
	selected: boolean;
	onselect: () => void;
}
let { selected, onselect }: Props = $props();

onMount(async () => {
	await RobotRestoreState.getProgram(Prompt.NEVER);
});
</script>

{#if RobotRestoreState.program}
	{#await RobotRestoreState.program}
		<div class="robot" class:selected onclick={onselect}>
			<div class="icon"><Circle size={40} color={"var(--primary)"} /></div>
			<div class="detail">
				<div class="name">{$_("LOADING_ROBOT")}</div>
			</div>
		</div>
	{:then result}
		{#if result}
			{@const robot = result.robot}
			<div class="robot" class:selected onclick={onselect}>
				<img class="icon" src={robot.icon} alt={robot.name}>
				<div class="detail">
					<div class="name">{$_("PROGRAM_STORED", { values: { robot: robot.name } })}</div>
					<div class="description">{$_("PROGRAM_STORED_DESCRIPTION")}</div>
				</div>
			</div>
		{/if}
	{/await}
{:else}
	<div class="robot" class:selected onclick={onselect}>
		<div class="icon"><Fa icon={faUsb} /></div>
		<div class="detail">
			<div class="name">{$_("CONNECT_TO_RESTORE")}</div>
		</div>
	</div>
{/if}

<style>
	.robot {
		background: var(--secondary);
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 15px;
		border-radius: 21px;
		text-align: start;
	}

	.selected {
		font-weight: bold;
	}

	.icon {
		width: 40px;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 20px;
	}

	.detail {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.name {
		font-size: 18px;
	}
</style>
