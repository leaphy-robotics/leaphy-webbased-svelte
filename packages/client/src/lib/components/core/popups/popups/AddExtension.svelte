<script lang="ts">
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import {
	faArrowLeft,
	faExclamationTriangle,
	faPlus,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { getMainWorkspace, type WorkspaceSvg } from "blockly";
import { getContext } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import Button from "$components/ui/Button.svelte";
import Select from "$components/ui/Select.svelte";
import Extensions, { extensions } from "$domain/blockly/extensions.svelte.js";
import { inFilter, robots } from "$domain/robots";
import type { PopupState } from "$state/popup.svelte";
import SerialState, { Prompt } from "$state/serial.svelte";

const boardOptions: [string, string][] = [
	["Arduino Uno", robots.l_uno.id],
	["Arduino Nano", robots.l_nano.id],
	["Arduino Nano ESP32", robots.l_nano_esp32.id],
];
let selectedBoard = $state(boardOptions[1][1]);
let enabled = $state(false);

function selectBoard() {
	SerialState.board = robots[selectedBoard];
	enabled = true;
}

let board = $derived(SerialState.board || robots.l_nano);
let enabledExtensions = $derived(
	extensions.filter((e) => inFilter(board, e.boards)),
);

let incompatibleExtensions = $derived(
	Extensions.enabled
		.map((e) => extensions.find((ext) => ext.id === e))
		.filter((e) => !inFilter(board, e.boards)),
);

function getColor(theme: string) {
	console.log(theme);
	return (getMainWorkspace() as WorkspaceSvg).getTheme().categoryStyles[theme]
		.colour;
}

const popupState = getContext<PopupState>("state");
function back() {
	popupState.close();
}

function toggle(extension: string) {
	Extensions.toggle(extension);
	back();
}
</script>

<div class="w-screen h-screen bg-bg-tint flex flex-col">
	<div class="bg-primary text-on-primary p-2.5">
		<Button onclick={back} mode="outlined" icon={faArrowLeft} name={$_("BACK")} />
	</div>

	{#if SerialState.port || enabled}
		<div class="p-2.5 flex flex-wrap gap-2.5 overflow-y-auto">
			{#each enabledExtensions as extension}
				{@const isEnabled = Extensions.isEnabled(extension.id)}
				<div aria-label="extension" class="max-w-75 w-full rounded-xl overflow-hidden flex flex-col bg-bg border-2 border-[lightgrey]">
					<div class="flex justify-center items-center w-full aspect-296/183" style:background={getColor(extension.style)}>
						<img src={`blockly-assets/${extension.id}.svg`} alt="" class="h-16">
					</div>
					<div class="flex-1 p-5 flex flex-col gap-2.5">
						<div class="font-bold text-lg">{$_(extension.name)}</div>
						<div class="text-sm">{$_(extension.description)}</div>
					</div>
					<button
						class="p-2.5 border-none text-on-primary font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
						style:background={isEnabled ? 'salmon' : 'var(--accent)'}
						onclick={() => toggle(extension.id)}
					>
						<Fa icon={isEnabled ? faXmark : faPlus} />
						{isEnabled ? $_("REMOVE_EXTENSION") : $_("ADD_EXTENSION")}
					</button>
				</div>
			{/each}

			{#each incompatibleExtensions as extension}
				<div class="max-w-[300px] w-full rounded-xl overflow-hidden flex flex-col bg-bg border-2 border-[lightgrey] opacity-60">
					<div class="flex justify-center items-center w-full aspect-[296/183] grayscale" style:background={getColor(extension.style)}>
						<img src={`blockly-assets/${extension.id}.svg`} alt="" class="h-16">
					</div>
					<div class="flex-1 p-5 flex flex-col gap-2.5">
						<div class="flex items-center gap-2.5">
							<span class="font-bold text-lg">{$_(extension.name)}</span>
							<span class="flex items-center gap-1.5 text-[salmon]"><Fa icon={faExclamationTriangle} /> {$_("INCOMPATIBLE_PROJECT")}</span>
						</div>
						<div class="text-sm">{$_(extension.description)}</div>
					</div>
					<button class="p-2.5 border-none text-on-primary font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer bg-[salmon]" onclick={() => toggle(extension.id)}>
						<Fa icon={faXmark} />
						{$_("REMOVE_EXTENSION")}
					</button>
				</div>
			{/each}
		</div>
	{:else}
		<div class="w-full h-full flex flex-col justify-center items-center">
			<div class="p-5 pt-8 max-w-[600px] w-full bg-bg rounded-2xl flex flex-col gap-8">
				<div class="flex flex-col items-center text-center">
					<div class="text-3xl pb-2.5"><Fa icon={faUsb} /></div>
					<h2 class="m-0 mb-2">{$_("EXTENSIONS_CONNECT_TITLE")}</h2>
					<div>{$_("EXTENSIONS_CONNECT_DESC")}</div>
				</div>

				<div class="flex flex-col gap-5">
					<Button onclick={() => SerialState.connect(Prompt.MAYBE)} mode={"accent"} large bold center name={$_("CHOOSE_ROBOT")} />
					<div class="flex flex-col gap-2.5">
						<span class="text-center text-on-secondary text-sm">{$_("OR_SELECT")}</span>
						<div class="flex gap-2.5 items-center">
							<Select mode="secondary" full options={boardOptions} bind:value={selectedBoard} />
							<Button onclick={selectBoard} mode={"primary"} center name={$_("SELECT")} />
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
