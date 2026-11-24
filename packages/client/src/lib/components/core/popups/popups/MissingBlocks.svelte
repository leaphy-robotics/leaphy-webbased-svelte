<script lang="ts">
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import BlockPreview from "$components/ui/BlockPreview.svelte";
import Button from "$components/ui/Button.svelte";
import {
	type MissingBlock,
	REQUIREMENT_KINDS,
	type RequirementKind,
} from "$domain/blockly/requiredBlocks";
import type { PopupState } from "$state/popup.svelte";

interface Props {
	/** Blocks the program is missing */
	missing: MissingBlock[];
}

const { missing }: Props = $props();

const popupState = getContext<PopupState>("state");

/** Why the blocks of each kind are needed */
const DESCRIPTIONS: Record<RequirementKind, string> = {
	setup: "MISSING_BLOCKS_SETUP",
	show: "MISSING_BLOCKS_SHOW",
	update: "MISSING_BLOCKS_UPDATE",
};

const sections = $derived(
	REQUIREMENT_KINDS.map((kind) => ({
		kind,
		blocks: missing.filter((item) => item.kind === kind),
	})).filter(({ blocks }) => blocks.length > 0),
);

// Without a required block the program doesn't work at all, so it can't be uploaded
const blocked = $derived(missing.some((item) => item.required));
</script>

<div class="p-5 flex flex-col min-w-[400px] max-w-[600px] text-center gap-4">
	<h2 class="m-0">{$_("MISSING_BLOCKS_TITLE")}</h2>

	{#each sections as { kind, blocks } (kind)}
		<div class="flex flex-col items-center gap-2">
			<div>
				{$_(DESCRIPTIONS[kind], { values: { count: blocks.length } })}
			</div>
			{#each blocks as { block } (block.type)}
				<BlockPreview {block} />
			{/each}
		</div>
	{/each}

	{#if blocked}
		<div class="flex justify-center mt-2">
			<Button
				name={$_("OK")}
				mode={"primary"}
				onclick={() => popupState.close(false)}
			/>
		</div>
	{:else}
		<div>{$_("MISSING_BLOCKS_UPLOAD_ANYWAY")}</div>
		<div class="flex justify-between mt-2">
			<Button
				name={$_("CANCEL")}
				mode={"secondary"}
				onclick={() => popupState.close(false)}
			/>
			<Button
				name={$_("UPLOAD")}
				mode={"primary"}
				onclick={() => popupState.close(true)}
			/>
		</div>
	{/if}
</div>
