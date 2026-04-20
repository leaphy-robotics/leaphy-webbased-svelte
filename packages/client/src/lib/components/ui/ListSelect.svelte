<script lang="ts">
import type { Snippet } from "svelte";

interface Props<Type extends { id: string }> {
	options: [string, Type][];
	value: Type;

	warning?: undefined | string;
	checkEnabled?: (value: unknown) => boolean;
	disabledText?: string;
	disabled?: Snippet;
	disabledSelect?: (value: unknown) => Promise<boolean>;
	render?: Snippet<[string, Type, boolean]>;
}
let {
	options,
	value = $bindable(),
	warning,
	checkEnabled,
	disabledText,
	disabled,
	disabledSelect,
	render,
}: Props<any> = $props();

let reloadEnabled = $state(0);

async function onselect(option: unknown, enabled: boolean) {
	if (!enabled) {
		if (!disabledSelect) return;

		const allow = await disabledSelect(option);
		if (!allow) return;

		reloadEnabled++;
	}

	value = option;
}
</script>

<div class="flex flex-col bg-secondary rounded-3xl overflow-hidden">
	{#if warning}
		<div class="flex justify-between w-full text-base border-none border-b-2 border-black/10 px-4 py-2.5 bg-warning text-on-secondary">
			{warning}
		</div>
	{/if}
	{#key reloadEnabled}
		{#each options as option}
			{@const enabled = checkEnabled ? checkEnabled(option[1]) : true}
			<button
				onclick={() => onselect(option[1], enabled)}
				class="flex justify-between items-center w-full text-base border-none border-b border-black/15 {render ? '' : 'h-9'} px-4 bg-transparent text-on-secondary last:border-b-0 hover:bg-black/5 transition-colors cursor-pointer
					{value?.id === option[1].id ? 'font-bold' : ''}"
			>
				{#if render}
					{@render render(option[0], option[1], value?.id === option[1].id)}
				{:else}
					{option[0]}
				{/if}

				{#if !enabled}
					{#if disabled}
						{@render disabled()}
					{:else}
						<span class="text-[#DD6929]">{disabledText}</span>
					{/if}
				{/if}
			</button>
		{/each}
	{/key}
</div>
