<script lang="ts">
import addExtensionIcon from "$assets/add-extension.svg";
import AddExtension from "$components/core/popups/popups/AddExtension.svelte";
import Extensions from "$domain/blockly/extensions.svelte.js";
import robotsGroups from "$domain/robots.groups";
import { RobotType } from "$domain/robots.types";
import PopupState from "$state/popup.svelte";
import WorkspaceState from "$state/workspace.svelte";
import { type WorkspaceSvg, utils } from "blockly";
import { OverlayScrollbarsComponent } from "overlayscrollbars-svelte";

interface Item {
	toolboxitemid: string;
	categorystyle: string;
	name: string;
}

interface Props {
	toolboxDef: Item[];
	workspace: WorkspaceSvg;
	selected: string;
}
let { toolboxDef, workspace, selected }: Props = $props();

function getColor(theme: string) {
	return workspace.getTheme().categoryStyles[theme].colour;
}

function addExtension() {
	PopupState.open({
		component: AddExtension,
		data: {},
		allowInteraction: false,
		allowOverflow: true,
	});
}

const enabledCategories = $derived(
	toolboxDef.filter((e) => Extensions.isEnabled(e.toolboxitemid)),
);
</script>

<div class="flex flex-col justify-between bg-[rgb(43,43,55)] gap-1.5 h-full w-20 overflow-x-visible">
	<OverlayScrollbarsComponent defer options={{ scrollbars: { theme: 'os-theme-light', autoHide: 'leave' } }}>
		<div class="flex flex-col overflow-x-hidden gap-1.5 flex-1">
			<div id="focusable"></div>
			{#each enabledCategories as item}
				<div
					class="h-18 w-20 p-1.5 border-l-8 border-solid hover:bg-white/20"
					id={item.toolboxitemid}
					style:border-color={getColor(item.categorystyle)}
					style:background={selected === item.toolboxitemid ? getColor(item.categorystyle) : undefined}
				>
					<div class="flex flex-col items-center gap-1 pointer-events-none h-full">
						<div class="flex-1 flex justify-center items-center">
							<img class="object-contain w-5 h-5" src={`blockly-assets/${item.toolboxitemid}.svg`} alt="">
						</div>
						<div class="shrink-0 text-xs font-bold text-center">{utils.parsing.replaceMessageReferences(item.name)}</div>
					</div>
				</div>
			{/each}
		</div>
	</OverlayScrollbarsComponent>

	{#if !([RobotType.L_MICROPYTHON, ...robotsGroups.L_FLITZ_ALL].includes(WorkspaceState.robot.type))}
		<button onclick={addExtension} class="cursor-pointer p-4 flex justify-center bg-primary border-none">
			<img class="object-contain w-7 h-7" src={addExtensionIcon} alt="">
		</button>
	{/if}
</div>
