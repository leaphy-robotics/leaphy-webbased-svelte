<script lang="ts">
import Windowed from "$components/core/popups/Windowed.svelte";
import { getTutorials, type TutorialItem } from "$education/tutorials";
import { _, locale } from "svelte-i18n";
	import Thumbnail from "./Thumbnail.svelte";
	import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
	import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
	import FontAwesomeIcon from "svelte-fa";
	import { onMount } from "svelte";
	import type { Tutorial } from "$education/tutorials";
	import WorkspaceState from "$state/workspace.svelte";

	let tutorial = $state<Tutorial | null>(null);
		let playlist = $derived(Array.isArray(tutorial?.item) ? tutorial?.item : null);
let currentItem = $derived(playlist?.find(item => item.video === video));
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
			<div class="dots">
				{#each playlist as item, index}
					<div class="dot" class:active={index === playlist.indexOf(currentItem)}></div>
				{/each}
			</div>
		{/if}
	{/snippet}
	
	<div class="content">
		{#if !video}
			<div class="grid">
				{#each getTutorials($locale, WorkspaceState.robot) as tutorial}
					<Thumbnail name={tutorial.name} item={tutorial.item} onclick={() => setTutorial(tutorial)} />
				{/each}
			</div>
		{:else}
			<div class="container">
				{#if playlist}
					{#if playlist.indexOf(currentItem) > 0}
						<button class="floatingButton left" onclick={previous}>
							<FontAwesomeIcon icon={faArrowLeft} />
						</button>
					{/if}
					{#if playlist.indexOf(currentItem) < playlist.length - 1}
						<button class="floatingButton right" onclick={next}>
							<FontAwesomeIcon icon={faArrowRight} />
						</button>
					{/if}
				{/if}
				<iframe class="video" credentialless allowfullscreen width="100%" height="100%" src="https://www.youtube.com/embed/{video}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" title="video"></iframe>
			</div>
		{/if}
	</div>
</Windowed>

<style>

	.grid {
		padding: 10px;
		width: 600px;
		aspect-ratio: 1920 / 1080;
		overflow-y: auto;
		gap: 10px;
		display: grid;
		flex: 1;
		grid-template-columns: repeat(2, 285px);
	}

	.video {
		width: 600px;
		aspect-ratio: 1920 / 1080;
	}

	.container {
		display: flex;
		flex-direction: column;
	}

	.floatingButton {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		font-size: 24px;
		background: var(--primary);
		border-radius: 50%;
		width: 50px;
		height: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--on-primary);
		cursor: pointer;
		border: none;
		padding: 0;
	}

	.floatingButton.left {
		left: -15px;
	}

	.floatingButton.right {
		right: -15px;
	}

	iframe {
		border-radius: 0 0 10px 10px;
	}

	.dots {
		display: flex;
		justify-content: center;
		align-items: center;
		padding-right: 5px;
		gap: 5px;
	}

	.dot {
		width: 10px;
		height: 10px;
		background: #00000060;
		border-radius: 50%;
	}

	.dot.active {
		background: var(--background);
	}
</style>
