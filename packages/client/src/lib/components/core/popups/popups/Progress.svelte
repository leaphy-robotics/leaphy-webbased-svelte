<script lang="ts">
import Button from "$components/ui/Button.svelte";
import ProgressBar from "$components/ui/ProgressBar.svelte";
import type { PopupState } from "$state/popup.svelte";
import { getContext, onMount } from "svelte";
import { _ } from "svelte-i18n";

interface Item {
	title: string;
	progress: number;
}

interface Props {
	generator: AsyncGenerator<Item, void, unknown>;
}
let { generator }: Props = $props();

const popupState = getContext<PopupState>("state");

let item = $state<Item>(null);
let done = $state(false);

onMount(async () => {
	for await (const newItem of generator) {
		item = newItem;
	}
	done = true;
});
</script>

<div class="content">
	{#if item}
		<h2 class="state">{$_(item.title)}</h2>

		{#if done}
			<Button
				name={$_("LEAVE_UPLOADING")}
				mode={"primary"}
				onclick={popupState.close}
			/>
		{:else}
			<ProgressBar progress={item.progress} />
		{/if}
	{/if}
</div>

<style>
	h2 {
		margin: 0;
	}

	.content {
		display: flex;
		flex-direction: column;
		padding: 20px;
		gap: 20px;
		justify-content: center;
		align-items: center;
		min-width: 400px;
		max-width: 80vw;
		min-height: 200px;
		max-height: 80vh;
	}

	.state {
		font-weight: bold;
	}
</style>
