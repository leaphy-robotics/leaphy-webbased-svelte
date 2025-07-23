<script lang="ts">
	interface Props {
		name: string;
		checked: boolean;
	}
	let { name, checked = $bindable() }: Props = $props();

	function toggle() {
		checked = !checked;
	}
</script>

<div class="line">
	<button type="button" class="switch" onclick={toggle} aria-label="switch">
		<span class="bubble" class:checked></span>
	</button>
	<span class="name">{name}</span>
</div>

<style>
	.line {
		display: flex;
		gap: 10px;
		align-items: center;
		font-size: 0.9em;
	}

	.switch {
		position: relative;
		background: var(--background);
		width: 43px;
		height: 23px;
		border-radius: 23px;
		border: 2px solid var(--background);
		outline: 0;
		cursor: pointer;
	}

	.bubble {
		position: absolute;
		transition: 0.3s ease;
		width: 20px;
		height: 20px;
		left: 0;
		top: 0;
		background: var(--primary);
		border-radius: 80px;
	}

	.bubble.checked {
		translate: 100%;
		background: var(--accent);
	}
</style>
