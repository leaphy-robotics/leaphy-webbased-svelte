<script lang="ts">
import { computePosition, size } from "@floating-ui/dom";
import { _ } from "svelte-i18n";

interface Props {
	open: boolean;
	options: [string, any][];
	mode: "primary" | "secondary" | "background";
	element: HTMLElement;
	onselect?: (value: string) => void;
	align?: "left" | "center"
}
const { open, options, mode, onselect, element, align = "center" }: Props = $props();

let wrapper = $state<HTMLDivElement>();
let position = $state<{ x: number; y: number }>();

$effect(() => {
	if (!open || !wrapper) return;

	computePosition(element, wrapper, {
		strategy: "fixed",
		placement: "bottom-start",
		middleware: [
			size({
				apply({ availableWidth, availableHeight, elements }) {
					console.log(availableWidth, availableHeight, elements.floating);
					Object.assign(elements.floating.style, {
						width: `${elements.reference.clientWidth}px`,
						maxWidth: `${Math.max(0, availableWidth)}px`,
						maxHeight: `${Math.max(0, availableHeight)}px`,
					});
				},
			}),
		],
	}).then(({ x, y }) => {
		position = { x, y };
	});
});
</script>

{#if open}
	<div bind:this={wrapper} class="popup" class:left={align === 'left'} class:secondary={mode === 'secondary'} style:left={`${position?.x}px`} style:top={`${position?.y}px`}>
		<div class="container">
			{#each options as option (option[1])}
				<button type="button" onclick={() => onselect(option[1])} class="option"
				>{$_(option[0])}</button>
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
		position: fixed;
		width: 100%;
		overflow-y: auto;
		z-index: 99;
		border-radius: 20px;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
		overflow: hidden;
		overflow-y: auto;
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

	.left .option {
		text-align: left;
	}
</style>
