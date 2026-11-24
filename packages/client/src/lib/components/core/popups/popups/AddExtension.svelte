<script lang="ts">
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import {
	faArrowLeft,
	faCheck,
	faExclamationTriangle,
	faMicrochip,
	faPlus,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { getMainWorkspace, type WorkspaceSvg } from "blockly";
import { getContext } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import Button from "$components/ui/Button.svelte";
import ExtensionBanner from "$components/ui/ExtensionBanner.svelte";
import Extensions, { extensions } from "$domain/blockly/extensions.svelte.js";
import { inFilter, robots } from "$domain/robots";
import type { PopupState } from "$state/popup.svelte";
import SerialState, { Prompt } from "$state/serial.svelte";

const boardOptions = [robots.l_nano, robots.l_nano_esp32];
let enabled = $state(false);

function selectBoard(id: string) {
	SerialState.board = robots[id];
	enabled = true;
}

let board = $derived(SerialState.board || robots.l_nano);
let availableExtensions = $derived(
	extensions.filter((e) => inFilter(board, e.boards)),
);

let incompatibleExtensions = $derived(
	Extensions.enabled
		.map((e) => extensions.find((ext) => ext.id === e))
		.filter((e) => e && !inFilter(board, e.boards)),
);

let showList = $derived(!!SerialState.port || enabled);

function getColor(theme: string) {
	return (getMainWorkspace() as WorkspaceSvg).getTheme().categoryStyles[theme]
		.colour;
}

const primaryColor =
	getComputedStyle(document.body).getPropertyValue("--primary").trim() ||
	"#06778f";

const popupState = getContext<PopupState>("state");
function back() {
	popupState.close();
}

function toggle(extension: string) {
	Extensions.toggle(extension);
	back();
}
</script>

{#snippet card(extension: (typeof extensions)[number], incompatible: boolean)}
	{@const isEnabled = Extensions.isEnabled(extension.id)}
	{@const color = getColor(extension.style)}
	<div aria-label="extension" class="flex flex-col rounded-xl overflow-hidden bg-bg border border-secondary">
		<div class="relative">
			<ExtensionBanner id={extension.id} {color} muted={incompatible} />
			{#if incompatible}
				<div class="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-white text-danger text-xs font-bold px-2.5 py-1">
					<Fa icon={faExclamationTriangle} />
					{$_("INCOMPATIBLE_PROJECT")}
				</div>
			{:else if isEnabled}
				<div class="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-white text-xs font-bold px-2.5 py-1" style:color={color}>
					<Fa icon={faCheck} />
					{$_("EXTENSION_ADDED")}
				</div>
			{/if}
		</div>
		<div class="flex-1 p-5 flex flex-col gap-1">
			<div class="font-bold text-xl">{$_(extension.name)}</div>
			<div class="text-sm">{$_(extension.description)}</div>
		</div>
		<button
			class="p-3 border-none text-white font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110
				{isEnabled || incompatible ? 'bg-[salmon]' : 'bg-accent'}"
			onclick={() => toggle(extension.id)}
		>
			<Fa icon={isEnabled || incompatible ? faXmark : faPlus} />
			{isEnabled || incompatible ? $_("REMOVE_EXTENSION") : $_("ADD_EXTENSION")}
		</button>
	</div>
{/snippet}

<div class="w-screen h-screen bg-bg-tint flex flex-col">
	<div class="bg-primary text-on-primary p-2.5 flex items-center gap-4">
		<Button onclick={back} mode="outlined" icon={faArrowLeft} name={$_("BACK")} />
		<div class="text-lg font-bold flex-1">{$_("EXTENSIONS")}</div>
		{#if showList}
			<div class="flex items-center gap-2 text-sm opacity-90">
				<Fa icon={faMicrochip} />
				{board.name}
			</div>
		{/if}
	</div>

	{#if showList}
		<div class="flex-1 overflow-y-auto p-2.5 flex flex-col gap-5">
			<div class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-2.5">
				{#each availableExtensions as extension (extension.id)}
					{@render card(extension, false)}
				{/each}
			</div>

			{#if incompatibleExtensions.length > 0}
				<div class="flex flex-col gap-2.5">
					<div class="flex flex-col gap-1 px-1">
						<div class="flex items-center gap-2 font-bold text-danger">
							<Fa icon={faExclamationTriangle} />
							{$_("INCOMPATIBLE_EXTENSIONS")}
						</div>
						<div class="text-sm text-on-secondary-muted">{$_("INCOMPATIBLE_EXTENSIONS_DESC")}</div>
					</div>
					<div class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-2.5">
						{#each incompatibleExtensions as extension (extension.id)}
							{@render card(extension, true)}
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="flex-1 flex flex-col justify-center items-center p-2.5 overflow-y-auto">
			<div class="max-w-[600px] w-full bg-bg rounded-xl border border-secondary overflow-hidden flex flex-col">
				<ExtensionBanner id="connect" color={primaryColor} />
				<div class="p-6 flex flex-col gap-6">
					<div class="flex flex-col gap-4">
						<div class="flex flex-col gap-1">
							<h2 class="m-0">{$_("EXTENSIONS_CONNECT_TITLE")}</h2>
							<div class="text-on-secondary-muted">{$_("EXTENSIONS_CONNECT_DESC")}</div>
						</div>
						<Button onclick={() => SerialState.connectWithFeedback(Prompt.MAYBE)} mode={"primary"} icon={faUsb} large bold name={$_("CHOOSE_ROBOT")} />
					</div>

					<div class="h-px bg-secondary"></div>

					<div class="flex flex-col gap-2.5">
						<span class="text-sm font-bold">{$_("OR_SELECT")}</span>
						<div class="grid grid-cols-2 gap-2.5">
							{#each boardOptions as option (option.id)}
								<button
									class="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-secondary bg-bg text-on-bg cursor-pointer transition-colors hover:border-primary"
									onclick={() => selectBoard(option.id)}
								>
									<img src={option.icon} alt="" class="h-9 w-6 object-contain">
									<span class="text-sm font-bold">{option.name}</span>
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
