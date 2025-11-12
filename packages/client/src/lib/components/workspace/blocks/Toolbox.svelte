<script lang="ts">
	import * as Blockly from "blockly"
	import addExtensionIcon from "$assets/add-extension.svg"
	import { OverlayScrollbarsComponent } from "overlayscrollbars-svelte";
	import PopupState from "$state/popup.svelte"
	import AddExtension from "$components/core/popups/popups/AddExtension.svelte";
	import Extensions from "$domain/blockly/extensions.svelte.js"
	import WorkspaceState from "$state/workspace.svelte";
	import robotsGroups from "$domain/robots.groups";
	import { RobotType } from "$domain/robots.types";

	interface Item {
		toolboxitemid: string
		categorystyle: string
		name: string
	}

	interface Props {
		toolboxDef: Item[]
		workspace: Blockly.WorkspaceSvg
		selected: string
	}
	let { toolboxDef, workspace, selected }: Props = $props()

	function getColor(theme: string) {
		return workspace.getTheme().categoryStyles[theme].colour
	}

	function addExtension() {
		PopupState.open({
			component: AddExtension,
			data: {},
			allowInteraction: false,
			allowOverflow: true,
		})
	}

	const enabledCategories = $derived(toolboxDef.filter(e => Extensions.isEnabled(e.toolboxitemid)))
</script>

<div class="toolbox">
	<OverlayScrollbarsComponent defer options={{ scrollbars: { theme: 'os-theme-light', autoHide: 'leave' } }}>
		<div class="categories">
			<div id="focusable"></div>
			{#each enabledCategories as item}
				<div class="category" id={item.toolboxitemid} style:border-color={getColor(item.categorystyle)} style:background={selected === item.toolboxitemid ? getColor(item.categorystyle) : undefined}>
					<div class="content">
						<div class="container">
							<img class="icon" src={`blockly-assets/${item.toolboxitemid}.svg`} alt="">
						</div>
						<div class="name">{Blockly.utils.parsing.replaceMessageReferences(item.name)}</div>
					</div>
				</div>
			{/each}
		</div>
	</OverlayScrollbarsComponent>

	{#if !([RobotType.L_MICROPYTHON, ...robotsGroups.L_FLITZ_ALL].includes(WorkspaceState.robot.type))}
		<button onclick={addExtension} class="addExtension">
			<img class="icon" src={addExtensionIcon} alt="">
		</button>
	{/if}
</div>

<style>
	.toolbox {
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		background: rgb(43, 43, 55);
		gap: 5px;
		height: 100%;
		width: 80px;
		overflow-x: visible;
	}

	.categories {
		display: flex;
		flex-direction: column;
		overflow-x: hidden;
		gap: 5px;
		flex: 1;
	}

	.category {
		height: 72px;
		width: 80px;
		padding: 5px;
		border-left: 8px solid;
	}

	.category:hover {
		background: rgba(255, 255, 255, .2);
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		pointer-events: none;
		height: 100%;
	}

	.container {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.icon {
		object-fit: contain; /* Keeps icon proportions */
		width: 20px;
		height: 20px;
	}

	.name {
		flex-shrink: 0; /* Prevents text from being compressed */
		font-size: 12px;
		font-weight: bold;
		text-align: center;
	}

	.addExtension {
		cursor: pointer;
		padding: 16px;
		display: flex;
		justify-content: center;
		background: var(--primary);
		border: none;
	}

	.addExtension .icon {
		width: 28px;
		height: 28px;
	}
</style>
