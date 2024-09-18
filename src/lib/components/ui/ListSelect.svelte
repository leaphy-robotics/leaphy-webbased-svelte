<script lang="ts">
interface Props {
	options: [string, unknown][];
	value: unknown;
	warning?: undefined | string;
	checkEnabled?: (value: unknown) => boolean;
	disabledText?: string;
	disabledSelect?: (value: unknown) => Promise<boolean>;
}
let {
	options,
	value = $bindable(),
	warning,
	checkEnabled,
	disabledText,
	disabledSelect,
}: Props = $props();

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
			<button onclick={() => onselect(option[1], enabled)} class="item" class:selected={$state.is(value, option[1])}>
				{option[0]}
				{#if !enabled}
					<span class="disabled">{disabledText}</span>
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

	.disabled {
		color: #DD6929;
	}
</style>
