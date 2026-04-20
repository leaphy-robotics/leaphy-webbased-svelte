<script lang="ts">
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";

interface Props {
	onclick: () => void;
	icon: IconDefinition;
}
const { onclick, icon }: Props = $props();
</script>

<button
	class="h-9 w-9 bg-transparent border border-primary-dark rounded-md text-on-primary cursor-pointer flex items-center justify-center hover:bg-white/10 transition-colors"
	{onclick}
>
	<Fa {icon} />
</button>
