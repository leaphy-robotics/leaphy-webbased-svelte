<script lang="ts">
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";

interface Props {
	icon: IconDefinition;
	action: string;
	onclick: () => void;
}
const { icon, action, onclick }: Props = $props();
</script>

<button
	class="group relative cursor-pointer text-xl h-16 w-16 border-none rounded-full flex justify-center items-center bg-primary text-on-primary pointer-events-auto hover:brightness-110 transition-all"
	{onclick}
>
	<span class="absolute right-full mr-4 bg-secondary text-on-secondary px-2.5 py-1.5 rounded-lg text-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-24">
		{$_(action)}
	</span>
	<Fa {icon} />
</button>
