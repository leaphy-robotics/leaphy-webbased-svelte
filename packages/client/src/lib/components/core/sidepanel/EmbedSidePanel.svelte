<script lang="ts">
	import EmbedState from "$state/embed.svelte";
</script>

<iframe title="material" src={EmbedState.sidebar}></iframe>

<style>
	iframe {
		width: 100%;
		height: 100%;
		border: none;
	}
</style>
