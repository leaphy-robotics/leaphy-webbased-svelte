<script lang="ts">
import AppState from "$state/app.svelte";

import Header from "$components/core/header/Header.svelte";
import Renderer from "$components/core/popups/Renderer.svelte";

$effect(() => {})
</script>

<div class="app">
    <Header />

    <AppState.screen />
    <Renderer />
</div>

<style>
    .app {
        min-height: 100vh;
    }
</style>
