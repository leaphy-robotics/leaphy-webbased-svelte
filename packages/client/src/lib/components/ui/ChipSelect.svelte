<script lang="ts">
interface Props<Type extends { id: string }> {
	options: [string, Type][];
	value: Type;
}
let { options, value = $bindable() }: Props<any> = $props();

function onselect(newValue: unknown) {
	value = newValue;
}

function getWidth() {
	return 100 / options.length;
}

function getPosition() {
	return options.findIndex(([_, v]) => v.id === value.id);
}
</script>

<div class="flex bg-secondary rounded-full p-1 h-9">
	<div class="flex-1 relative overflow-hidden rounded-full">
		<div class="flex gap-1.5 h-full">
			{#each options as option}
				<button
					onclick={() => onselect(option[1])}
					class="flex-1 flex items-center justify-center cursor-pointer px-4 bg-transparent border-none z-[9] relative after:content-[''] after:absolute after:left-full after:top-0 after:h-full after:w-0.5 after:bg-bg-tint after:mx-0.5 last:after:content-[unset]"
				>{option[0]}</button>
			{/each}
		</div>
		<div
			class="absolute top-0 h-full before:block before:content-[''] before:w-full before:h-full before:bg-bg transition-all duration-200"
			style:left="calc({getPosition()} * {getWidth()}% + {getPosition()} * 3px)"
			style:width="calc({getWidth()}% - 3px)"
		></div>
	</div>
</div>
