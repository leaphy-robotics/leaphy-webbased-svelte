<script lang="ts">
interface Props {
	open: boolean;
	options: [string, any][];
	mode: "primary" | "secondary";
	onselect?: (value: string) => void;
}
const { open, options, mode, onselect }: Props = $props();
</script>

{#if open}
	<div class="popup" class:secondary={mode === 'secondary'}>
		<div class="container">
			{#each options as option (option[1])}
				<button type="button" onclick={() => onselect(option[1])} class="option"
				>{option[0]}</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.option {
		position: relative;
		background: var(--primary-dark-tint);
		color: var(--on-primary);
		border: none;
		padding: 10px 15px;
		border-radius: 20px;
	}

	.secondary .option {
		background: var(--secondary);
		color: var(--on-secondary);
	}

	.popup {
		width: 100%;
		position: absolute;
		max-height: 400px;
		overflow-y: auto;
		z-index: 99;
		border-radius: 20px;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
		overflow: hidden;
		box-shadow: var(--shadow-el1);
	}

	.container {
		overflow-y: auto;
		max-height: 200px;

		display: flex;
		flex-direction: column;
	}

	.option {
		background: var(--primary);
		border-radius: 0;
		text-overflow: ellipsis;
		width: 100%;
	}

	.secondary .option {
		background: var(--robot);
	}
</style>
