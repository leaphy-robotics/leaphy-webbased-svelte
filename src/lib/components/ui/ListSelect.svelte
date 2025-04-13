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
}
let {
	options,
	value = $bindable(),
	warning,
	checkEnabled,
	disabledText,
	disabled,
	disabledSelect,
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

<div class="list">
	{#if warning}
		<div class="warning item">{warning}</div>
	{/if}
	{#key reloadEnabled}
		{#each options as option}
			{@const enabled = checkEnabled ? checkEnabled(option[1]) : true}
			<button onclick={() => onselect(option[1], enabled)} class="item" class:selected={value.id === option[1].id}>
				{option[0]}
				{#if !enabled}
					{#if disabled}
						{@render disabled()}
					{:else}
						<span class="disabledText">{disabledText}</span>
					{/if}
				{/if}
			</button>
		{/each}
	{/key}
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
		background: var(--secondary);
		border-radius: 21px;
		overflow: hidden;
	}

	.item {
		display: flex;
		justify-content: space-between;
		width: 100%;
		font-size: 1em;
		border: none;
		border-bottom: 2px solid #00000025;
		padding: 10px 15px;
		background: none;
		color: var(--on-secondary);
	}

	.warning {
		background: var(--warning);
	}

	.selected {
		font-weight: bold;
	}

	.item:last-child {
		border-bottom: none;
	}

	.disabledText {
		color: #DD6929;
	}
</style>
