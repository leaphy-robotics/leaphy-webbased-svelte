<script lang="ts">
    import { screen } from "$state/app.svelte";

    import Header from "$components/core/header/Header.svelte";
    import Renderer from "$components/core/popups/Renderer.svelte";
</script>

<div class="app">
    <Header />

    <svelte:component this={$screen} />
    <Renderer />
</div>

<style>
    .app {
        min-height: 100vh;
    }
</style>
