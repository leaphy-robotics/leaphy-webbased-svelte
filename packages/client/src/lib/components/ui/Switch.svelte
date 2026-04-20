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

<div class="flex gap-2.5 items-center text-sm">
	<button
		type="button"
		class="relative w-11 h-6 rounded-full border-2 border-bg bg-bg outline-none cursor-pointer"
		onclick={toggle}
		aria-label="switch"
	>
		<span
			class="absolute top-0 left-0 w-5 h-5 rounded-full transition-all duration-300 ease-in-out
				{checked ? 'translate-x-full bg-accent' : 'translate-x-0 bg-primary'}"
		></span>
	</button>
	<span>{name}</span>
</div>
