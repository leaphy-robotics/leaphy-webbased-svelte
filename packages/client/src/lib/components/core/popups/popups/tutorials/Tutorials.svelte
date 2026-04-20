<script lang="ts">
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { onMount } from "svelte";
import FontAwesomeIcon from "svelte-fa";
import { _, locale } from "svelte-i18n";
import Windowed from "$components/core/popups/Windowed.svelte";
import type { Tutorial } from "$education/tutorials";
import { getTutorials, type TutorialItem } from "$education/tutorials";
import WorkspaceState from "$state/workspace.svelte";
import Thumbnail from "./Thumbnail.svelte";

let tutorial = $state<Tutorial | null>(null);
let playlist = $derived(Array.isArray(tutorial?.item) ? tutorial?.item : null);
let currentItem = $derived(playlist?.find((item) => item.video === video));
let video = $state<string>();

interface Props {
	initialTutorial?: Tutorial;
}
let { initialTutorial }: Props = $props();

onMount(() => {
	if (initialTutorial) {
		setTutorial(initialTutorial);
	}
});

function setTutorial(item: Tutorial) {
	tutorial = item;
	if (typeof item.item === "string") {
		video = item.item;
	} else {
		video = item.item[0].video;
	}
}

function next() {
	if (!playlist || !currentItem) return;
	if (playlist.indexOf(currentItem) < playlist.length - 1) {
		video = playlist[playlist.indexOf(currentItem) + 1].video;
	}
}

function previous() {
	if (!playlist || !currentItem) return;
	if (playlist.indexOf(currentItem) > 0) {
		video = playlist[playlist.indexOf(currentItem) - 1].video;
	}
}
</script>

<Windowed title={tutorial?.name || $_("TUTORIALS")}>
	{#snippet actions()}
		{#if playlist}
			<div class="flex justify-center items-center pr-1.5 gap-1.5">
				{#each playlist as item, index}
					<div class="w-2.5 h-2.5 rounded-full {index === playlist.indexOf(currentItem) ? 'bg-bg' : 'bg-black/40'}"></div>
				{/each}
			</div>
		{/if}
	{/snippet}

	<div>
		{#if !video}
			<div class="p-2.5 w-[600px] aspect-video overflow-y-auto gap-2.5 grid grid-cols-2 flex-1">
				{#each getTutorials($locale, WorkspaceState.robot) as tutorial}
					<Thumbnail name={tutorial.name} item={tutorial.item} onclick={() => setTutorial(tutorial)} />
				{/each}
			</div>
		{:else}
			<div class="relative flex flex-col">
				{#if playlist}
					{#if playlist.indexOf(currentItem) > 0}
						<button class="absolute top-1/2 -translate-y-1/2 -left-4 text-2xl bg-primary rounded-full w-12 h-12 flex justify-center items-center text-on-primary cursor-pointer border-none" onclick={previous}>
							<FontAwesomeIcon icon={faArrowLeft} />
						</button>
					{/if}
					{#if playlist.indexOf(currentItem) < playlist.length - 1}
						<button class="absolute top-1/2 -translate-y-1/2 -right-4 text-2xl bg-primary rounded-full w-12 h-12 flex justify-center items-center text-on-primary cursor-pointer border-none" onclick={next}>
							<FontAwesomeIcon icon={faArrowRight} />
						</button>
					{/if}
				{/if}
				<iframe class="w-[600px] aspect-video rounded-b-xl" credentialless allowfullscreen src="https://www.youtube.com/embed/{video}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" title="video"></iframe>
			</div>
		{/if}
	</div>
</Windowed>
