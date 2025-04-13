<script lang="ts">
import Windowed from "$components/core/popups/Windowed.svelte";
import Select from "$components/ui/Select.svelte";
import tutorials, {
	type Tutorial,
	type TutorialItem,
	type Video,
} from "$education/tutorials";
import { _, locale } from "svelte-i18n";
import { get } from "svelte/store";

type State = "START" | "TYPE" | "VIDEO";
let screen = $state<State>("START");

let tutorial = $state<Tutorial>();
let items = $state<TutorialItem[]>();
let videos = $state<[string, string][]>();
let reversedVideos = $derived(
	videos?.map((video) => video.toReversed() as [string, string]),
);
let video = $state<string>();

function setVideo(item: Video) {
	if (Array.isArray(item[get(locale)])) {
		videos = item[get(locale)] as [string, string][];
		video = videos[0][0];
	} else {
		video = item[get(locale)] as string;
	}
	screen = "VIDEO";
}

function selectTutorial(newTutorial: Tutorial) {
	tutorial = newTutorial;
	if (Array.isArray(tutorial.item)) {
		items = tutorial.item;
		screen = "TYPE";
	} else {
		setVideo(tutorial.item);
	}
}
</script>

<Windowed title={$_("TUTORIALS")}>
	{#snippet actions()}
		{#if reversedVideos}
			<Select full bind:value={video} options={reversedVideos} />
		{/if}
	{/snippet}
	<div class="content">
		{#if screen === "START"}
			<div class="grid">
				{#each tutorials as tutorial}
					<button onclick={() => selectTutorial(tutorial)} class="tutorial">
						<img class="icon" src={tutorial.icon} alt="" />
						<span class="name">{tutorial.name[$locale]}</span>
					</button>
				{/each}
			</div>
		{:else if screen === "TYPE"}
			<h1 class="title">Wat wil je doen?</h1>
			<div class="types">
				{#each items as item}
					<button onclick={() => setVideo(item.video)} class="type">
						<img class="icon" src={item.icon} alt="" />
						<span class="name">{item.name[$locale]}</span>
					</button>
				{/each}
			</div>
		{:else if screen === "VIDEO"}
			<iframe credentialless allowfullscreen width="100%" height="100%" src="https://www.youtube.com/embed/{video}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" title="video"></iframe>
		{/if}
	</div>
</Windowed>

<style>
	.content {
		width: 600px;
		aspect-ratio: 1920 / 1080;
		overflow-y: auto;
		line-height: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.grid {
		padding: 10px;
		gap: 10px;
		display: grid;
		flex: 1;
		grid-template-columns: repeat(4, 1fr);
	}

	.tutorial {
		aspect-ratio: 1/1;
		cursor: pointer;
		height: min-content;
		border: 3px solid var(--secondary);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		justify-content: end;
		align-items: center;
		gap: 5px;
		padding: 10px;
		transition: 0.3s ease;
		background: none;
		color: var(--on-background);
	}
	.tutorial:hover {
		border: 3px solid var(--primary);
	}

	.icon {
		flex: 1;
		max-width: 100%;
		max-height: calc(100% - 29px);
	}

	.types {
		display: flex;
		flex-direction: column;
		width: 100%;
		align-items: center;
		gap: 10px;
		padding: 10px;
	}

	.type {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
		height: 1fr;
		width: 50%;
		font-size: 18px;
		background: var(--background-tint);
		border: 5px solid var(--secondary);
		border-radius: 10px;
		cursor: pointer;
	}

	.type .icon {
		height: 50px;
		flex: unset;
	}

	.title {
		text-align: center;
		margin-top: 30px;
		margin-bottom: 30px;
	}
</style>
