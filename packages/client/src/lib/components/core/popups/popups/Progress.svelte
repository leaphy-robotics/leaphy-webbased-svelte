<script lang="ts">
import { getContext, onMount } from "svelte";
import { _ } from "svelte-i18n";
import Button from "$components/ui/Button.svelte";
import ProgressBar from "$components/ui/ProgressBar.svelte";
import type { PopupState } from "$state/popup.svelte";

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

<div class="flex flex-col p-5 gap-5 justify-center items-center min-w-[400px] max-w-[80vw] min-h-[200px] max-h-[80vh]">
	{#if item}
		<h2 class="m-0 font-bold">{$_(item.title)}</h2>

		{#if done}
			<Button name={$_("LEAVE_UPLOADING")} mode={"primary"} onclick={popupState.close} />
		{:else}
			<ProgressBar progress={item.progress} />
		{/if}
	{/if}
</div>
