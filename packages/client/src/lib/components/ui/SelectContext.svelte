<script lang="ts">
import { computePosition, size } from "@floating-ui/dom";
import { _ } from "svelte-i18n";

interface Props {
	open: boolean;
	options: [string, any][];
	mode: "primary" | "secondary" | "background";
	element: HTMLElement;
	onselect?: (value: string) => void;
	align?: "left" | "center";
}
const {
	open,
	options,
	mode,
	onselect,
	element,
	align = "center",
}: Props = $props();

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

const optionClasses = {
	primary: "bg-primary text-on-primary",
	secondary: "bg-robot text-on-secondary",
	background: "bg-primary text-on-primary",
};
</script>

{#if open}
	<div
		bind:this={wrapper}
		class="fixed w-full overflow-hidden overflow-y-auto rounded-b-2xl z-[99] shadow-[var(--shadow-el1)]"
		style:left={`${position?.x}px`}
		style:top={`${position?.y}px`}
	>
		<div class="overflow-y-auto max-h-48 flex flex-col">
			{#each options as option (option[1])}
				<button
					type="button"
					onclick={() => onselect(option[1])}
					class="border-none px-4 py-2.5 w-full text-ellipsis
						{align === 'left' ? 'text-left' : 'text-center'}
						{optionClasses[mode]}"
				>{$_(option[0])}</button>
			{/each}
		</div>
	</div>
{/if}
