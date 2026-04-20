<script lang="ts">
import { type Tutorial, getTutorials } from "$education/tutorials";
import PopupsState, { Anchor } from "$state/popup.svelte";
import type { PopupState } from "$state/popup.svelte";
import WorkspaceState from "$state/workspace.svelte";
import { faList, faPlay, faVideo } from "@fortawesome/free-solid-svg-icons";
import { getContext } from "svelte";
import FontAwesomeIcon from "svelte-fa";
import { _, locale } from "svelte-i18n";
import Thumbnail from "../tutorials/Thumbnail.svelte";
import Tutorials from "../tutorials/Tutorials.svelte";

let popupState = getContext<PopupState>("state");

function openTutorial(tutorial: Tutorial) {
	PopupsState.open({
		component: Tutorials,
		data: { initialTutorial: tutorial },
		allowInteraction: true,
		allowOverflow: true,
		position: {
			x: window.innerWidth / 2 - 320,
			y: window.innerHeight / 2 - 210,
		},
	});
	popupState.close();
}
</script>

<div class="flex flex-nowrap gap-2.5 overflow-x-auto w-[378px]">
	{#each getTutorials($locale, WorkspaceState.robot) as tutorial}
		<div class="w-[218px] shrink-0">
			<Thumbnail name={tutorial.name} item={tutorial.item} onclick={() => openTutorial(tutorial)} />
		</div>
	{/each}
</div>
