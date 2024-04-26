<script lang="ts">
    import appState from "$state/app.svelte";

    import Header from "$components/core/header/Header.svelte";
    import Renderer from "$components/core/popups/Renderer.svelte";
</script>

<div class="app">
    <Header />

    <svelte:component this={appState.screen} />
    <Renderer />
</div>

<style>
    .app {
        min-height: 100vh;
    }
</style>
