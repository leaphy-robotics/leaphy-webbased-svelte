<script lang="ts">
import SelectContext from "$components/ui/SelectContext.svelte";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";

interface Props {
	options: [string, any][];
	full?: boolean;
	mode?: "primary" | "secondary";
	value: any;
	align?: "left" | "center";
}
let {
	options,
	value = $bindable(),
	full = false,
	mode = "primary",
	align = "center",
}: Props = $props();

let open = $state(false);
let element = $state<HTMLButtonElement>();

function getName(value: any) {
	return $_(options.find(([_, data]) => data === value)?.[0] || "");
}

async function onclick() {
	open = !open;
}

function select(newValue: string) {
	open = false;
	value = newValue;
}
</script>

<div class="relative {full ? 'w-full' : 'w-36'}">
	<button
		type="button"
		bind:this={element}
		{onclick}
		class="relative w-full border-none h-9 px-4
			{open ? 'rounded-tl-2xl rounded-tr-2xl rounded-bl-none rounded-br-none' : 'rounded-2xl'}
			{align === 'left' ? 'text-left' : 'text-center'}
			{mode === 'secondary' ? 'bg-secondary text-on-secondary' : 'bg-primary-dark text-on-primary'}"
	>
		<span>{getName(value)}</span>
		<span class="absolute right-4 top-1/2 -translate-y-1/2"><Fa icon={faCaretDown} /></span>
	</button>
	<SelectContext {mode} {open} {options} onselect={select} {element} {align} />
</div>
