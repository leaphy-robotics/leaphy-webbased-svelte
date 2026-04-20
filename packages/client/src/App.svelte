<script lang="ts">
import AppState from "$state/app.svelte";

import Header from "$components/core/header/Header.svelte";
import Renderer from "$components/core/popups/Renderer.svelte";
import ComponentRenderer from "$components/ui/ComponentRenderer.svelte";
</script>

<div class="min-h-screen">
	<Header />
	<ComponentRenderer component={AppState.Screen} />
	<Renderer />
</div>
