<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown'
	import {getContext, onDestroy, onMount} from "svelte";
	import type {Writable} from "svelte/store";
	import {popups, type PopupState} from "$state/popup.svelte";
	import { _ } from 'svelte-i18n'

	interface Props {
		explanation: Promise<string>
	}

	let { explanation }: Props = $props();

	const popupState = getContext<Writable<PopupState>>("state");

	let element: HTMLDivElement
	function click(event: MouseEvent) {
		if (element.contains(event.target as HTMLElement)) return

		popups.close($popupState.id);
	}

	onMount(() => {
		document.body.addEventListener('click', click)
	})
	onDestroy(() => {
		document.body.removeEventListener('click', click)
	})
</script>

<div class="content" bind:this={element}>
	<h2>{$_("EXPLANATION")}</h2>
	{#await explanation}
		<div class="container">
			<div class="loading"></div>
			<div class="loading"></div>
			<div class="loading"></div>
			<div class="loading"></div>
		</div>
	{:then explanation}
		<SvelteMarkdown source="{explanation}" />
	{/await}
	<div class="footer">{$_("META_ATTRIBUTION")}</div>
</div>

<style>
	.content {
		width: 400px;
		padding: 20px;
	}

	.footer {
		color: var(--on-secondary-muted);
	}

	.container {
		display: flex;
		flex-direction: column;
		gap: 5px;
		margin: 16px 0;
	}

	.loading {
		background: linear-gradient(
			100deg,
			rgba(255, 255, 255, 0) 40%,
			rgba(255, 255, 255, .5) 50%,
			rgba(255, 255, 255, 0) 60%
		) #a5a5a550;
		background-size: 200% 100%;
		background-position-x: 180%;
		animation: 1s loading ease-in-out infinite;

		height: 14px;
		width: 100%;
	}

	@keyframes loading {
		to {
			background-position-x: -20%;
		}
	}
</style>
