<script lang="ts">
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import type { Snippet } from "svelte";
import { onMount } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import { Circle } from "svelte-loading-spinners";
import RobotRestoreState from "$state/robotRestore.svelte";
import { Prompt } from "$state/serial.svelte";

interface Props {
	selected: boolean;
	onselect: () => void;
}
let { selected, onselect }: Props = $props();

onMount(async () => {
	await RobotRestoreState.getProgram(Prompt.NEVER);
});
</script>

{#snippet robotRow(icon: Snippet, content: Snippet)}
	<div class="bg-secondary flex items-center gap-2.5 px-4 py-2 rounded-full text-start cursor-pointer {selected ? 'font-bold' : ''}" onclick={onselect}>
		{@render icon()}
		<div class="flex flex-col gap">
			{@render content()}
		</div>
	</div>
{/snippet}

{#if RobotRestoreState.program}
	{#await RobotRestoreState.program}
		{#snippet loadingIcon()}<div class="w-10 h-10 flex justify-center items-center text-xl"><Circle size={40} color={"var(--primary)"} /></div>{/snippet}
		{#snippet loadingContent()}<div class="text-lg">{$_("LOADING_ROBOT")}</div>{/snippet}
		{@render robotRow(loadingIcon, loadingContent)}
	{:then result}
		{#if result}
			{@const robot = result.robot}
			{#snippet resultIcon()}<img class="w-10 h-10 object-contain" src={robot.icon} alt={robot.name}>{/snippet}
			{#snippet resultContent()}
				<div class="text-lg">{$_("PROGRAM_STORED", { values: { robot: robot.name } })}</div>
				<div class="text-sm text-on-secondary-muted">{$_("PROGRAM_STORED_DESCRIPTION")}</div>
			{/snippet}
			{@render robotRow(resultIcon, resultContent)}
		{/if}
	{/await}
{:else}
	{#snippet usbIcon()}<div class="w-10 h-10 flex justify-center items-center text-xl"><Fa icon={faUsb} /></div>{/snippet}
	{#snippet usbContent()}<div class="text-lg">{$_("CONNECT_TO_RESTORE")}</div>{/snippet}
	{@render robotRow(usbIcon, usbContent)}
{/if}
