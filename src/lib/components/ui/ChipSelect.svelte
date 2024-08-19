<script lang="ts">
interface Props {
	options: [string, unknown][];
	value: unknown;
}
let { options, value = $bindable() }: Props = $props();

function onselect(newValue: unknown) {
	value = newValue;
}

function getWidth() {
	return 100 / options.length;
}

function getPosition() {
	return options.findIndex(([_, v]) => $state.is(v, value));
}
</script>

<div class="wrapper">
	<div class="content">
		<div class="chips">
			{#each options as option}
				<button onclick={() => onselect(option[1])} class="chip">{option[0]}</button>
			{/each}
		</div>
		<div class="selected" style:--position="{getPosition()}" style:--width="{getWidth()}%"></div>
	</div>
</div>

<style>
	.wrapper {
		display: flex;
		background: var(--secondary);
		border-radius: 20px;
		padding: 3px;
	}

	.content {
		flex: 1;
		position: relative;
		overflow: hidden;
		border-radius: 20px;
	}

	.chips {
		display: flex;
		gap: 6px;
	}

	.chip {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		padding: 10px 15px;
		background: none;
		z-index: 9;
		border: none;
		position: relative;
	}
	.chip:after {
		content: "";
		position: absolute;
		left: 100%;
		top: 0;
		height: 100%;
		width: 2px;
		background: var(--background-tint);
		margin: 0 2px;
	}
	.chip:last-child:after {
		content: unset;
	}

	.selected {
		position: absolute;
		left: calc(var(--position) * var(--width) + var(--position) * 3px);
		top: 0;
		width: calc(var(--width) - 3px);
		height: 100%;
	}
	.selected::before {
		display: block;
		content: "";
		width: 100%;
		height: 100%;
		background: var(--background);
	}
</style>
