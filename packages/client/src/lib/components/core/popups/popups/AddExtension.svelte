<script lang="ts">
	import Fa from "svelte-fa";
	import {faArrowLeft, faExclamationTriangle, faPlus, faXmark} from "@fortawesome/free-solid-svg-icons";
	import Button from "$components/ui/Button.svelte";
	import {_} from "svelte-i18n";
	import {extensions} from "$domain/blockly/extensions.svelte.js";
	import {getContext} from "svelte";
	import {PopupState} from "$state/popup.svelte";
	import {getMainWorkspace, type WorkspaceSvg} from "blockly";
	import * as Blockly from "blockly";
	import Extensions from "$domain/blockly/extensions.svelte.js"
	import SerialState, { Prompt } from "$state/serial.svelte";
	import { faUsb } from "@fortawesome/free-brands-svg-icons";
	import { RobotType } from "$domain/robots.types";
	import { inFilter, robots } from "$domain/robots";

	let board = $derived(SerialState.board || robots.l_nano)
	let enabledExtensions = $derived(extensions.filter(e => inFilter(board, e.boards)))

	let incompatibleExtensions = $derived(Extensions.enabled.map(e => extensions.find(ext => ext.id === e)).filter(e => !inFilter(board, e.boards)))

	function getColor(theme: string) {
		console.log(theme)
		return (getMainWorkspace() as WorkspaceSvg).getTheme().categoryStyles[theme].colour
	}

	const popupState = getContext<PopupState>("state");
	function back() {
		popupState.close()
	}

	function toggle(extension: string) {
		Extensions.toggle(extension);
		back()
	}
</script>

<div class="page">
	<div class="header">
		<Button onclick={back} mode="outlined" icon={faArrowLeft} name={$_("BACK")} />
	</div>

	{#if SerialState.port}
		<div class="grid">
			{#each enabledExtensions as extension}
				{@const enabled = Extensions.isEnabled(extension.id)}
				<div class="extension">
					<div class="cover" style:background={getColor(extension.style)}>
						<img src={`blockly-assets/${extension.id}.svg`} alt="">
					</div>
					<div class="content">
						<div class="name">{$_(extension.name)}</div>
						<div class="description">{$_(extension.description)}</div>
					</div>
					<button style:background={enabled ? 'salmon' : 'var(--accent)'} onclick={() => toggle(extension.id)}>
						<Fa icon={enabled ? faXmark : faPlus} />
						{enabled ? $_("REMOVE_EXTENSION") : $_("ADD_EXTENSION")}
					</button>
				</div>
			{/each}

			{#each incompatibleExtensions as extension}
				<div class="extension incompatible">
					<div class="cover" style:background={getColor(extension.style)}>
						<img src={`blockly-assets/${extension.id}.svg`} alt="">
					</div>
					<div class="content">
						<div class="line">
							<div class="name">{$_(extension.name)}</div>
							<div class="warning"><Fa icon={faExclamationTriangle} /> {$_("INCOMPATIBLE_PROJECT")}</div>
						</div>
						<div class="description">{$_(extension.description)}</div>
					</div>
					<button style:background={'salmon'} onclick={() => toggle(extension.id)}>
						<Fa icon={faXmark} />
						{$_("REMOVE_EXTENSION")}
					</button>
				</div>
			{/each}
		</div>
	{:else}
		<div class="connect-wrapper">
			<div class="form">
				<div class="connect-text">
					<div class="connect-icon"><Fa icon={faUsb} /></div>
					<h2>{$_("EXTENSIONS_CONNECT_TITLE")}</h2>
					<div>{$_("EXTENSIONS_CONNECT_DESC")}</div>
				</div>
				
				<Button onclick={() => SerialState.connect(Prompt.MAYBE)} mode={"accent"} large bold center name={$_("CHOOSE_ROBOT")} />
			</div>
		</div>
	{/if}
</div>

<style>
	.page {
		width: 100vw;
		height: 100vh;
		background: var(--background-tint);
	}

	.header {
		background: var(--primary);
		color: var(--on-primary);
		padding: 10px;
	}

	.grid {
		padding: 10px;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.extension {
		max-width: 300px;
		width: 100%;
		border-radius: 10px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background: var(--background);
		border: 2px solid lightgrey;
	}

	.cover {
		display: flex;
		justify-content: center;
		align-items: center;

		width: 100%;
		aspect-ratio: 296/183;
	}

	.cover img {
		height: 60px;
	}

	.content {
		flex: 1;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.name {
		font-weight: bold;
		font-size: 18px;
	}

	button {
		padding: 10px;
		background: var(--accent);
		border: none;
		color: var(--on-primary);
		font-weight: bold;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		cursor: pointer;
	}

	.connect-wrapper {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.connect-icon {
		font-size: 30px;
		padding-bottom: 10px;
	}

	.connect-text {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.form {
		padding: 20px;
		padding-top: 30px;
		max-width: 600px;
		width: 100%;
		background: var(--background);
		border-radius: 20px;

		display: flex;
		flex-direction: column;
		gap: 30px;
	}

	.incompatible {
		.cover {
			filter: grayscale(100%);
			opacity: 0.5;
		}
		.name, .description {
			opacity: 0.5;
		}
	}

	.line {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	.warning {
		display: flex;
		align-items: center;
		gap: 5px;
		color: salmon;
	}
</style>
