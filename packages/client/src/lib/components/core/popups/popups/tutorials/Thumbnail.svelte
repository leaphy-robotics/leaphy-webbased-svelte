<script lang="ts">
import { faList, faPlay, faVideo } from "@fortawesome/free-solid-svg-icons";
import FontAwesomeIcon from "svelte-fa";
import type { TutorialItem } from "$education/tutorials";

interface Props {
	name: string;
	item: TutorialItem[] | string;
	onclick: () => void;
}
let { name, item, onclick }: Props = $props();

function getThumbnail(item: TutorialItem[] | string) {
	if (typeof item === "string") {
		return `https://img.youtube.com/vi/${item}/0.jpg`;
	}
	return `https://img.youtube.com/vi/${item[0].video}/0.jpg`;
}
</script>

<div class="w-full flex flex-col gap-1.5 cursor-pointer" {onclick}>
	<div class="relative overflow-hidden rounded-xl leading-none">
		<img class="w-full aspect-video bg-secondary object-cover" src={getThumbnail(item)} alt={name} />
		<div class="absolute inset-0 flex justify-center items-center bg-black/40 text-white text-4xl">
			<FontAwesomeIcon icon={faPlay} />
		</div>
	</div>
	<span class="text-sm font-bold truncate flex items-center gap-1.5">
		<FontAwesomeIcon icon={typeof item === "string" ? faVideo : faList} /> {name}
	</span>
</div>
