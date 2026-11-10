<script lang="ts">
import {
	faLightbulb,
	type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";

interface Props {
	title: string;
	text: string;
	icon?: IconDefinition;
}
const { title, text, icon = faLightbulb }: Props = $props();
</script>

<div class="flex gap-3 rounded-xl bg-accent/15 p-3 text-left">
	<span class="mt-0.5 text-lg text-accent"><Fa {icon} /></span>
	<div class="flex flex-col gap-1">
		<div class="font-bold">{title}</div>
		<div class="text-sm leading-relaxed">{text}</div>
	</div>
</div>
