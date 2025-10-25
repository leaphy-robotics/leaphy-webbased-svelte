<script lang="ts">
	import Fa from "svelte-fa";
	import {faArrowLeft, faPlus, faXmark} from "@fortawesome/free-solid-svg-icons";
	import Button from "$components/ui/Button.svelte";
	import {_} from "svelte-i18n";
	import {extensions} from "$domain/blockly/extensions.svelte.js";
	import {getContext} from "svelte";
	import {PopupState} from "$state/popup.svelte";
	import {getMainWorkspace, type WorkspaceSvg} from "blockly";
	import * as Blockly from "blockly";
	import Extensions from "$domain/blockly/extensions.svelte.js"

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

	<div class="grid">
		{#each extensions as extension}
			{@const enabled = Extensions.isEnabled(extension.id)}
			<div class="extension">
				<div class="cover" style:background={getColor(extension.style)}>
					<img src={`blockly-assets/${extension.id}.svg`} alt="">
				</div>
				<div class="content">
					<div class="name">{Blockly.utils.parsing.replaceMessageReferences(extension.name)}</div>
					<div class="description">{extension.description}</div>
				</div>
				<button style:background={enabled ? 'salmon' : 'var(--accent)'} onclick={() => toggle(extension.id)}>
					<Fa icon={enabled ? faXmark : faPlus} />
					{enabled ? 'Remove' : 'Add'}
				</button>
			</div>
		{/each}
	</div>
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
</style>
